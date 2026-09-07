/**
 * controllers/staff.controller.js — Manager & Employee Management
 *
 * Handles CRUD for manager and employee users (staff roles).
 * All operations are scoped to req.scopedOwnerId.
 *
 * ONBOARDING FLOW:
 * 1. Owner POSTs to create a manager or employee
 * 2. System auto-generates a temp password
 * 3. User account is created with status='pending', mustChangePassword=true
 * 4. Credentials email is sent to the new staff member
 * 5. Staff member logs in → forced to change password → status becomes 'active'
 */

import { User, UserProfile, Building } from "../models/index.js";
import {
  createStaffWithProfile,
  updateStaffWithProfile,
  deleteStaffWithCleanup,
  findStaffByIdScoped,
} from "../services/staff.service.js";
import { generateTempPassword } from "../services/auth.service.js";
import { sendCredentials } from "../services/email.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Op } from "sequelize";

// ─── GET ALL STAFF ────────────────────────────────────────────────────────────
/**
 * GET /api/v1/staff?role=manager&page=1&limit=10&search=john&buildingId=xxx
 *
 * Returns managers and/or employees scoped to the current owner.
 * Supports filtering by role, building, and name/email search.
 */
export const getAllStaff = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10, search, buildingId, status } = req.query;
  const offset = (page - 1) * limit;

  // Build WHERE clause — always scoped to current owner
  const where = {
    ownerId: req.scopedOwnerId,
    role: role ? role : { [Op.in]: ["manager", "employee"] },
  };

  if (status) where.status = status;
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // Build profile WHERE clause for building filter
  const profileWhere = {};
  if (buildingId) profileWhere.buildingId = buildingId;

  const { count, rows: staff } = await User.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: UserProfile,
        as: "profile",
        where: Object.keys(profileWhere).length ? profileWhere : undefined,
        required: Object.keys(profileWhere).length > 0,
        include: [
          { model: Building, as: "building", attributes: ["id", "name", "address"], required: false },
        ],
      },
    ],
  });

  return ApiResponse.paginated(res, staff, count, page, limit, "Staff fetched.");
});

// ─── GET SINGLE STAFF MEMBER ──────────────────────────────────────────────────
export const getStaffById = asyncHandler(async (req, res) => {
  const user = await findStaffByIdScoped(req.params.id, req.scopedOwnerId);
  if (!user) return ApiResponse.error(res, 404, "Staff member not found.");
  user.password = undefined;
  return ApiResponse.success(res, 200, "Staff member fetched.", { staff: user });
});

// ─── CREATE STAFF (Manager or Employee) ───────────────────────────────────────
/**
 * POST /api/v1/staff
 * Body (multipart/form-data):
 *   name, email, role (manager|employee), phone, salary, jobTitle,
 *   buildingId?, extraFields (JSON string)?
 *   Files: avatar?, cnic?
 */
export const createStaff = asyncHandler(async (req, res) => {
  const {
    name, email, role, phone, salary, jobTitle,
    buildingId, extraFields,
  } = req.body;

  // Validate role
  if (!["manager", "employee"].includes(role)) {
    return ApiResponse.error(res, 400, "Role must be 'manager' or 'employee'.");
  }

  // Check email uniqueness
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return ApiResponse.error(res, 400, "A user with this email already exists.");
  }

  // Validate buildingId belongs to this owner
  if (buildingId) {
    const building = await Building.findOne({ where: { id: buildingId, ownerId: req.scopedOwnerId } });
    if (!building) return ApiResponse.error(res, 400, "Invalid building: not found under your account.");
  }

  // Extract uploaded file URLs (Cloudinary via multer-storage-cloudinary)
  const files = {
    avatar: req.files?.avatar?.[0]?.path || null,
    cnic: req.files?.cnic?.[0]?.path || null,
  };

  // Generate temp password
  const tempPassword = generateTempPassword();

  // Create user + profile in one service call
  const { user, profile } = await createStaffWithProfile({
    ownerId: req.scopedOwnerId,
    name,
    email,
    tempPassword,
    role,
    profileData: {
      phone,
      salary: salary ? parseFloat(salary) : null,
      jobTitle,
      buildingId: buildingId || null,
      extraFields: extraFields ? JSON.parse(extraFields) : [],
    },
    files,
  });

  // Fetch owner name and building name for the email
  const owner = await User.findByPk(req.scopedOwnerId, { attributes: ["name"] });
  let buildingName = null;
  if (buildingId) {
    const b = await Building.findByPk(buildingId, { attributes: ["name"] });
    buildingName = b?.name;
  }

  // Send credentials email to the new staff member
  try {
    await sendCredentials({
      toEmail: email,
      toName: name,
      tempPassword,
      role,
      ownerName: owner.name,
      buildingName,
    });
  } catch (emailError) {
    // Don't fail the request if email fails — log and continue
    console.error("[Email] Failed to send credentials:", emailError.message);
  }

  user.password = undefined;
  return ApiResponse.success(res, 201, `${role.charAt(0).toUpperCase() + role.slice(1)} created. Credentials sent to ${email}.`, {
    staff: user, profile,
  });
});

// ─── UPDATE STAFF ─────────────────────────────────────────────────────────────
/**
 * PUT /api/v1/staff/:id
 */
export const updateStaff = asyncHandler(async (req, res) => {
  const staffUser = await findStaffByIdScoped(req.params.id, req.scopedOwnerId);
  if (!staffUser) return ApiResponse.error(res, 404, "Staff member not found.");

  const profile = staffUser.profile;
  const { name, email, status, phone, salary, jobTitle, buildingId, extraFields } = req.body;

  // Validate buildingId if changing
  if (buildingId) {
    const building = await Building.findOne({ where: { id: buildingId, ownerId: req.scopedOwnerId } });
    if (!building) return ApiResponse.error(res, 400, "Invalid building.");
  }

  const files = {
    avatar: req.files?.avatar?.[0]?.path || null,
    cnic: req.files?.cnic?.[0]?.path || null,
  };

  await updateStaffWithProfile({
    user: staffUser,
    profile,
    updateData: { name, email, status },
    profileData: {
      phone,
      salary: salary !== undefined ? parseFloat(salary) : undefined,
      jobTitle,
      buildingId,
      extraFields: extraFields ? JSON.parse(extraFields) : undefined,
    },
    files,
  });

  staffUser.password = undefined;
  return ApiResponse.success(res, 200, "Staff member updated successfully.", { staff: staffUser });
});

// ─── TOGGLE STATUS ────────────────────────────────────────────────────────────
/**
 * PATCH /api/v1/staff/:id/status
 * Toggles between active and inactive
 */
export const toggleStaffStatus = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!user) return ApiResponse.error(res, 404, "Staff member not found.");

  user.status = user.status === "active" ? "inactive" : "active";
  await user.save();

  return ApiResponse.success(res, 200, `Staff member ${user.status === "active" ? "activated" : "deactivated"}.`, {
    status: user.status,
  });
});

// ─── DELETE STAFF ─────────────────────────────────────────────────────────────
/**
 * DELETE /api/v1/staff/:id
 */
export const deleteStaff = asyncHandler(async (req, res) => {
  const staffUser = await findStaffByIdScoped(req.params.id, req.scopedOwnerId);
  if (!staffUser) return ApiResponse.error(res, 404, "Staff member not found.");

  await deleteStaffWithCleanup(staffUser, staffUser.profile);
  return ApiResponse.success(res, 200, "Staff member deleted successfully.");
});

// ─── RESEND CREDENTIALS ───────────────────────────────────────────────────────
/**
 * POST /api/v1/staff/:id/resend-credentials
 * Generates a new temp password and resends the credentials email.
 */
export const resendCredentials = asyncHandler(async (req, res) => {
  const staffUser = await User.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!staffUser) return ApiResponse.error(res, 404, "Staff member not found.");

  const tempPassword = generateTempPassword();
  staffUser.password = tempPassword; // Will be hashed by beforeUpdate hook
  staffUser.mustChangePassword = true;
  staffUser.status = "pending";
  await staffUser.save();

  const owner = await User.findByPk(req.scopedOwnerId, { attributes: ["name"] });

  await sendCredentials({
    toEmail: staffUser.email,
    toName: staffUser.name,
    tempPassword,
    role: staffUser.role,
    ownerName: owner.name,
    buildingName: null,
  });

  return ApiResponse.success(res, 200, `Credentials resent to ${staffUser.email}.`);
});
