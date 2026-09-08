/**
 * features/manager/manager.controller.js — Manager Dashboard & Building View
 *
 * A manager is assigned to exactly one building (Building.managerId).
 * Everything here is scoped to that single building, never the owner's
 * full portfolio.
 */

import { Building, User, UserProfile, Tenancy } from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";

const findMyBuilding = (managerId) =>
  Building.findOne({ where: { managerId } });

// ─── GET MANAGER DASHBOARD ────────────────────────────────────────────────────
export const getManagerDashboard = asyncHandler(async (req, res) => {
  const building = await findMyBuilding(req.user.id);

  if (!building) {
    return ApiResponse.success(res, 200, "No building assigned yet.", {
      building: null,
      employeesCount: 0,
      tenantsCount: 0,
      recentActivity: [],
    });
  }

  const [employeesCount, tenantsCount, recentActivity] = await Promise.all([
    User.count({
      where: { role: "employee", ownerId: req.scopedOwnerId },
      include: [{ model: UserProfile, as: "profile", where: { buildingId: building.id }, required: true }],
    }),
    Tenancy.count({ where: { buildingId: building.id, status: "active" } }),
    Tenancy.findAll({
      where: { buildingId: building.id },
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [{ model: User, as: "tenant", attributes: ["id", "name", "email"] }],
    }),
  ]);

  return ApiResponse.success(res, 200, "Manager dashboard fetched.", {
    building,
    employeesCount,
    tenantsCount,
    recentActivity,
  });
});

// ─── GET MY BUILDING (full detail) ────────────────────────────────────────────
export const getMyBuilding = asyncHandler(async (req, res) => {
  const building = await findMyBuilding(req.user.id);

  if (!building) {
    return ApiResponse.error(res, 404, "You are not currently assigned to a building.");
  }

  return ApiResponse.success(res, 200, "Building fetched.", { building });
});