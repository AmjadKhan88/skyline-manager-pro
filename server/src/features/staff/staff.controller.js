/**
 * features/staff/staff.controller.js — Manager & Employee Management
 *
 * ONBOARDING FLOW:
 * 1. Owner POSTs to create a manager or employee
 * 2. System auto-generates a temp password
 * 3. User account is created with status='pending', mustChangePassword=true
 * 4. Credentials email is sent to the new staff member
 * 5. Staff member logs in → forced to change password → status becomes 'active'
 */

import { User, UserProfile, Building } from "../../models/index.js";
import {
  createStaffWithProfile,
  updateStaffWithProfile,
  deleteStaffWithCleanup,
  findStaffByIdScoped,
} from "./staff.service.js";
import { generateTempPassword } from "../../shared/services/token.service.js";
import { sendCredentials } from "../../shared/services/email.service.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import { Op } from "sequelize";

// ─── GET ALL STAFF ────────────────────────────────────────────────────────────
export const getAllStaff = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10, search, buildingId, status } = req.query;
  const offset = (page - 1) * limit;

  const where = {
    ownerId: req.scopedOwnerId,
    role: role ? role : { [Op.in]: ["manager", "employee"] },
  };

  // Managers can only ever see employees, never other managers, and only in their own building
  let managerBuildingId = null;
  if (req.user.role === "manager") {
    where.role = "employee";
    const myBuilding = await Building.findOne({ where: { managerId: req.user.id } });
    if (!myBuilding) {
      return ApiResponse.paginated(res, [], 0, page, limit, "No building assigned yet.");
    }
    managerBuildingId = myBuilding.id;
  }

  if (status) where.status = status;

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const profileWhere = {};
  if (buildingId) profileWhere.buildingId = buildingId;
  if (managerBuildingId) profileWhere.buildingId = managerBuildingId; // manager scoping wins

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

  if (req.user.role === "manager") {
    const myBuilding = await Building.findOne({ where: { managerId: req.user.id } });
    if (user.role !== "employee" || !myBuilding || user.profile?.buildingId !== myBuilding.id) {
      return ApiResponse.error(res, 403, "You can only view employees in your own building.");
    }
  }

  user.password = undefined;
  return ApiResponse.success(res, 200, "Staff member fetched.", { staff: user });
});

// ─── CREATE STAFF (Manager or Employee) ───────────────────────────────────────
export const createStaff = asyncHandler(async (req, res) => {
  const {
    name, email, role, phone, salary, jobTitle,
    buildingId, extraFields,
  } = req.body;

  if (!["manager", "employee"].includes(role)) {
    return ApiResponse.error(res, 400, "Role must be 'manager' or 'employee'.");
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return ApiResponse.error(res, 400, "A user with this email already exists.");
  }

  if (buildingId) {
    const building = await Building.findOne({ where: { id: buildingId, ownerId: req.scopedOwnerId } });
    if (!building) return ApiResponse.error(res, 400, "Invalid building: not found under your account.");
  }

  const files = {
    avatar: req.files?.avatar?.[0]?.path || null,
    cnic: req.files?.cnic?.[0]?.path || null,
  };

  const tempPassword = generateTempPassword();

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

  const owner = await User.findByPk(req.scopedOwnerId, { attributes: ["name"] });
  let buildingName = null;
  if (buildingId) {
    const b = await Building.findByPk(buildingId, { attributes: ["name"] });
    buildingName = b?.name;
  }

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
    console.error("[Email] Failed to send credentials:", emailError.message);
  }

  user.password = undefined;
  return ApiResponse.success(res, 201, `${role.charAt(0).toUpperCase() + role.slice(1)} created. Credentials sent to ${email}.`, {
    staff: user, profile,
  });
});

// ─── UPDATE STAFF ─────────────────────────────────────────────────────────────
export const updateStaff = asyncHandler(async (req, res) => {
  const staffUser = await findStaffByIdScoped(req.params.id, req.scopedOwnerId);
  if (!staffUser) return ApiResponse.error(res, 404, "Staff member not found.");

  const profile = staffUser.profile;
  const { name, email, status, phone, salary, jobTitle, buildingId, extraFields } = req.body;

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
export const deleteStaff = asyncHandler(async (req, res) => {
  const staffUser = await findStaffByIdScoped(req.params.id, req.scopedOwnerId);
  if (!staffUser) return ApiResponse.error(res, 404, "Staff member not found.");

  await deleteStaffWithCleanup(staffUser, staffUser.profile);
  return ApiResponse.success(res, 200, "Staff member deleted successfully.");
});

// ─── RESEND CREDENTIALS ───────────────────────────────────────────────────────
export const resendCredentials = asyncHandler(async (req, res) => {
  const staffUser = await User.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!staffUser) return ApiResponse.error(res, 404, "Staff member not found.");

  const tempPassword = generateTempPassword();
  staffUser.password = tempPassword;
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