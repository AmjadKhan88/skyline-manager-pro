/**
 * controllers/owner.controller.js — Owner Dashboard & Profile
 *
 * All endpoints here are scoped to the authenticated owner via req.scopedOwnerId.
 * The dashboard aggregates summary statistics for the owner's entire portfolio.
 */

import { User, UserProfile, Building, Tenancy, OwnerProfile } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Op } from "sequelize";

// ─── GET DASHBOARD STATS ───────────────────────────────────────────────────────
/**
 * GET /api/v1/owner/dashboard
 *
 * Returns aggregated statistics for the owner's dashboard:
 * - Building count & breakdown
 * - Manager, employee, tenant counts
 * - Payment status overview
 * - Recent activity
 *
 * ALL queries are scoped to req.scopedOwnerId — other owners' data is never touched.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const ownerId = req.scopedOwnerId;

  // Run all count queries in parallel for performance
  const [
    totalBuildings,
    activeBuildings,
    totalManagers,
    activeManagers,
    totalEmployees,
    activeEmployees,
    totalTenants,
    activeTenants,
    totalTenancies,
    paidTenancies,
    unpaidTenancies,
    overdueTenancies,
  ] = await Promise.all([
    Building.count({ where: { ownerId } }),
    Building.count({ where: { ownerId, isActive: true } }),

    User.count({ where: { ownerId, role: "manager" } }),
    User.count({ where: { ownerId, role: "manager", status: "active" } }),

    User.count({ where: { ownerId, role: "employee" } }),
    User.count({ where: { ownerId, role: "employee", status: "active" } }),

    User.count({ where: { ownerId, role: "tenant" } }),
    User.count({ where: { ownerId, role: "tenant", status: "active" } }),

    Tenancy.count({ where: { ownerId, status: "active" } }),
    Tenancy.count({ where: { ownerId, paymentStatus: "paid", status: "active" } }),
    Tenancy.count({ where: { ownerId, paymentStatus: "unpaid", status: "active" } }),
    Tenancy.count({ where: { ownerId, paymentStatus: "overdue", status: "active" } }),
  ]);

  // Recent buildings (last 5 added)
  const recentBuildings = await Building.findAll({
    where: { ownerId },
    order: [["createdAt", "DESC"]],
    limit: 5,
    attributes: ["id", "name", "address", "buildingType", "status", "units", "occupancy", "createdAt"],
  });

  // Recent staff additions (last 5)
  const recentStaff = await User.findAll({
    where: {
      ownerId,
      role: { [Op.in]: ["manager", "employee", "tenant"] },
    },
    order: [["createdAt", "DESC"]],
    limit: 5,
    attributes: ["id", "name", "email", "role", "status", "createdAt"],
    include: [{ model: UserProfile, as: "profile", attributes: ["jobTitle", "buildingId"] }],
  });

  return ApiResponse.success(res, 200, "Dashboard data fetched.", {
    stats: {
      buildings: { total: totalBuildings, active: activeBuildings },
      managers: { total: totalManagers, active: activeManagers },
      employees: { total: totalEmployees, active: activeEmployees },
      tenants: { total: totalTenants, active: activeTenants },
      tenancies: {
        total: totalTenancies,
        paid: paidTenancies,
        unpaid: unpaidTenancies,
        overdue: overdueTenancies,
      },
    },
    recentBuildings,
    recentStaff,
  });
});

// ─── GET OWNER PROFILE ────────────────────────────────────────────────────────
/**
 * GET /api/v1/owner/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
    include: [{ model: OwnerProfile, as: "ownerProfile" }],
  });

  return ApiResponse.success(res, 200, "Profile fetched.", { user });
});

// ─── UPDATE OWNER PROFILE ─────────────────────────────────────────────────────
/**
 * PUT /api/v1/owner/profile
 * Body: { name, businessName, businessAddress, phone, taxId }
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, businessName, businessAddress, phone, taxId } = req.body;

  const user = await User.findByPk(req.user.id);
  if (name) user.name = name;
  await user.save();

  // Update or create OwnerProfile
  const [profile] = await OwnerProfile.upsert({
    userId: user.id,
    businessName: businessName ?? undefined,
    businessAddress: businessAddress ?? undefined,
    phone: phone ?? undefined,
    taxId: taxId ?? undefined,
  });

  user.password = undefined;
  return ApiResponse.success(res, 200, "Profile updated successfully.", { user, profile });
});
