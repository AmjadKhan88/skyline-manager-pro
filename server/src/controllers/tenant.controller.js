/**
 * controllers/tenant.controller.js — Tenant & Lease Management
 *
 * Manages tenant users and their associated tenancy (lease) records.
 * Every tenant belongs to an owner via ownerId, and has a Tenancy
 * record linking them to a specific building and unit.
 *
 * All queries are scoped to req.scopedOwnerId.
 */

import { User, UserProfile, Tenancy, Building } from "../models/index.js";
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

// ─── GET ALL TENANTS ──────────────────────────────────────────────────────────
/**
 * GET /api/v1/tenants?page=1&limit=10&buildingId=xxx&paymentStatus=unpaid
 */
export const getAllTenants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, buildingId, paymentStatus, search } = req.query;
  const offset = (page - 1) * limit;

  // Base tenant user query
  const where = { ownerId: req.scopedOwnerId, role: "tenant" };
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // Tenancy filter (join to filter by building or payment status)
  const tenancyWhere = { ownerId: req.scopedOwnerId };
  if (buildingId) tenancyWhere.buildingId = buildingId;
  if (paymentStatus) tenancyWhere.paymentStatus = paymentStatus;

  const { count, rows: tenants } = await User.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
    include: [
      { model: UserProfile, as: "profile", required: false },
      {
        model: Tenancy,
        as: "tenancies",
        where: tenancyWhere,
        required: false,
        include: [
          { model: Building, as: "building", attributes: ["id", "name", "address"], required: false },
        ],
      },
    ],
  });

  return ApiResponse.paginated(res, tenants, count, page, limit, "Tenants fetched.");
});

// ─── GET SINGLE TENANT ────────────────────────────────────────────────────────
export const getTenantById = asyncHandler(async (req, res) => {
  const tenant = await User.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId, role: "tenant" },
    attributes: { exclude: ["password"] },
    include: [
      { model: UserProfile, as: "profile", required: false },
      {
        model: Tenancy,
        as: "tenancies",
        include: [
          { model: Building, as: "building", attributes: ["id", "name", "address"], required: false },
        ],
        required: false,
      },
    ],
  });

  if (!tenant) return ApiResponse.error(res, 404, "Tenant not found.");
  return ApiResponse.success(res, 200, "Tenant fetched.", { tenant });
});

// ─── CREATE TENANT ────────────────────────────────────────────────────────────
/**
 * POST /api/v1/tenants
 * Body: {
 *   name, email, phone,
 *   buildingId, unitNumber, monthlyRent, depositAmount,
 *   leaseStart, leaseEnd?,
 *   extraFields?
 * }
 */
export const createTenant = asyncHandler(async (req, res) => {
  const {
    name, email, phone,
    buildingId, unitNumber, monthlyRent, depositAmount,
    leaseStart, leaseEnd, extraFields,
  } = req.body;

  // Validate email uniqueness
  const existing = await User.findOne({ where: { email } });
  if (existing) return ApiResponse.error(res, 400, "A user with this email already exists.");

  // Validate building belongs to this owner
  const building = await Building.findOne({ where: { id: buildingId, ownerId: req.scopedOwnerId } });
  if (!building) return ApiResponse.error(res, 400, "Invalid building: not found under your account.");

  // Generate temp password
  const tempPassword = generateTempPassword();

  // Create tenant User + UserProfile
  const { user } = await createStaffWithProfile({
    ownerId: req.scopedOwnerId,
    name,
    email,
    tempPassword,
    role: "tenant",
    profileData: {
      phone,
      buildingId,
      extraFields: extraFields ? JSON.parse(extraFields) : [],
    },
    files: {},
  });

  // Create the Tenancy (lease) record
  const tenancy = await Tenancy.create({
    tenantId: user.id,
    buildingId,
    ownerId: req.scopedOwnerId,
    unitNumber,
    monthlyRent: parseFloat(monthlyRent),
    depositAmount: depositAmount ? parseFloat(depositAmount) : 0,
    leaseStart,
    leaseEnd: leaseEnd || null,
    paymentStatus: "unpaid",
    status: "active",
  });

  // Send credentials email
  const owner = await User.findByPk(req.scopedOwnerId, { attributes: ["name"] });
  try {
    await sendCredentials({
      toEmail: email,
      toName: name,
      tempPassword,
      role: "tenant",
      ownerName: owner.name,
      buildingName: building.name,
    });
  } catch (err) {
    console.error("[Email] Failed to send tenant credentials:", err.message);
  }

  user.password = undefined;
  return ApiResponse.success(res, 201, `Tenant created. Credentials sent to ${email}.`, { tenant: user, tenancy });
});

// ─── UPDATE TENANT ────────────────────────────────────────────────────────────
/**
 * PUT /api/v1/tenants/:id
 */
export const updateTenant = asyncHandler(async (req, res) => {
  const tenantUser = await User.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId, role: "tenant" },
    include: [{ model: UserProfile, as: "profile", required: false }],
  });
  if (!tenantUser) return ApiResponse.error(res, 404, "Tenant not found.");

  const { name, email, status, phone, extraFields } = req.body;

  await updateStaffWithProfile({
    user: tenantUser,
    profile: tenantUser.profile,
    updateData: { name, email, status },
    profileData: {
      phone,
      extraFields: extraFields ? JSON.parse(extraFields) : undefined,
    },
    files: {},
  });

  tenantUser.password = undefined;
  return ApiResponse.success(res, 200, "Tenant updated successfully.", { tenant: tenantUser });
});

// ─── UPDATE PAYMENT STATUS ────────────────────────────────────────────────────
/**
 * PATCH /api/v1/tenants/:id/payment
 * Body: { tenancyId, paymentStatus }
 */
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { tenancyId, paymentStatus } = req.body;

  const tenancy = await Tenancy.findOne({
    where: { id: tenancyId, ownerId: req.scopedOwnerId },
  });

  if (!tenancy) return ApiResponse.error(res, 404, "Tenancy record not found.");

  tenancy.paymentStatus = paymentStatus;
  await tenancy.save();

  return ApiResponse.success(res, 200, "Payment status updated.", { tenancy });
});

// ─── DELETE TENANT ────────────────────────────────────────────────────────────
/**
 * DELETE /api/v1/tenants/:id
 */
export const deleteTenant = asyncHandler(async (req, res) => {
  const tenantUser = await User.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId, role: "tenant" },
    include: [{ model: UserProfile, as: "profile", required: false }],
  });
  if (!tenantUser) return ApiResponse.error(res, 404, "Tenant not found.");

  // Soft-delete all their tenancies first
  await Tenancy.destroy({ where: { tenantId: tenantUser.id, ownerId: req.scopedOwnerId } });
  await deleteStaffWithCleanup(tenantUser, tenantUser.profile);

  return ApiResponse.success(res, 200, "Tenant deleted successfully.");
});

// ─── GET MY LEASE (Tenant Self-View) ─────────────────────────────────────────
/**
 * GET /api/v1/tenants/my-lease
 * Used by the tenant themselves to view their own lease info.
 * req.user is the tenant; scopedOwnerId is their owner's ID.
 */
export const getMyLease = asyncHandler(async (req, res) => {
  const tenancies = await Tenancy.findAll({
    where: { tenantId: req.user.id },
    include: [
      { model: Building, as: "building", attributes: ["id", "name", "address", "buildingType"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  return ApiResponse.success(res, 200, "Your lease information.", { tenancies });
});
