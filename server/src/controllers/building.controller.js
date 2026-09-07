/**
 * controllers/building.controller.js — Building CRUD
 *
 * MULTI-SaaS ISOLATION:
 * Every query uses { ownerId: req.scopedOwnerId } injected by tenantScope middleware.
 * This guarantees owners can only see/edit their own buildings, and managers
 * can only see the buildings belonging to their owner.
 *
 * AUTHORIZATION MATRIX:
 * GET /buildings         → owner, manager
 * GET /buildings/:id     → owner, manager
 * POST /buildings        → owner only
 * PUT /buildings/:id     → owner only
 * DELETE /buildings/:id  → owner only
 */

import { Building, User, UserProfile } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// ─── GET ALL BUILDINGS (Scoped) ───────────────────────────────────────────────
/**
 * GET /api/v1/buildings?page=1&limit=10&search=tower&type=residential
 */
export const getAllBuildings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, type, status } = req.query;
  const offset = (page - 1) * limit;

  // Build dynamic WHERE clause
  const where = { ownerId: req.scopedOwnerId };
  if (type) where.buildingType = type;
  if (status) where.status = status;
  if (search) {
    const { Op } = await import("sequelize");
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { address: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows: buildings } = await Building.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "manager",
        attributes: ["id", "name", "email"],
        required: false,
      },
    ],
  });

  return ApiResponse.paginated(res, buildings, count, page, limit, "Buildings fetched.");
});

// ─── GET SINGLE BUILDING ──────────────────────────────────────────────────────
export const getBuildingById = asyncHandler(async (req, res) => {
  const building = await Building.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
    include: [
      { model: User, as: "manager", attributes: ["id", "name", "email"], required: false },
      { model: User, as: "owner", attributes: ["id", "name", "email"] },
    ],
  });

  if (!building) return ApiResponse.error(res, 404, "Building not found.");
  return ApiResponse.success(res, 200, "Building fetched.", { building });
});

// ─── CREATE BUILDING ──────────────────────────────────────────────────────────
/**
 * POST /api/v1/buildings
 * Body: { name, address, city, buildingType, floors, units, status, description, managerId?, extraFields? }
 */
export const createBuilding = asyncHandler(async (req, res) => {
  const {
    name, address, city, buildingType, floors, units,
    status, description, managerId, extraFields,
    energyRating, greenCertification,
  } = req.body;

  // Validate that managerId (if provided) belongs to this owner
  if (managerId) {
    const manager = await User.findOne({
      where: { id: managerId, ownerId: req.scopedOwnerId, role: "manager" },
    });
    if (!manager) {
      return ApiResponse.error(res, 400, "Invalid manager: not found under your account.");
    }
  }

  const building = await Building.create({
    name,
    address,
    city,
    buildingType,
    floors,
    units,
    status,
    description,
    managerId: managerId || null,
    energyRating,
    greenCertification,
    extraFields: extraFields || [],
    ownerId: req.scopedOwnerId, // Always set to the logged-in owner
  });

  return ApiResponse.success(res, 201, "Building created successfully.", { building });
});

// ─── UPDATE BUILDING ──────────────────────────────────────────────────────────
/**
 * PUT /api/v1/buildings/:id
 */
export const updateBuilding = asyncHandler(async (req, res) => {
  const building = await Building.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });

  if (!building) return ApiResponse.error(res, 404, "Building not found.");

  const {
    name, address, city, buildingType, floors, units,
    status, description, managerId, extraFields,
    energyRating, greenCertification, isActive, occupancy,
  } = req.body;

  // Validate managerId if being changed
  if (managerId !== undefined && managerId !== null) {
    const manager = await User.findOne({
      where: { id: managerId, ownerId: req.scopedOwnerId, role: "manager" },
    });
    if (!manager) {
      return ApiResponse.error(res, 400, "Invalid manager: not found under your account.");
    }
  }

  await building.update({
    name: name ?? building.name,
    address: address ?? building.address,
    city: city ?? building.city,
    buildingType: buildingType ?? building.buildingType,
    floors: floors ?? building.floors,
    units: units ?? building.units,
    status: status ?? building.status,
    description: description ?? building.description,
    managerId: managerId !== undefined ? managerId : building.managerId,
    energyRating: energyRating ?? building.energyRating,
    greenCertification: greenCertification ?? building.greenCertification,
    extraFields: extraFields ?? building.extraFields,
    isActive: isActive ?? building.isActive,
    occupancy: occupancy ?? building.occupancy,
  });

  return ApiResponse.success(res, 200, "Building updated successfully.", { building });
});

// ─── DELETE BUILDING ──────────────────────────────────────────────────────────
/**
 * DELETE /api/v1/buildings/:id
 * Soft-delete via Sequelize paranoid: true
 */
export const deleteBuilding = asyncHandler(async (req, res) => {
  const building = await Building.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });

  if (!building) return ApiResponse.error(res, 404, "Building not found.");

  await building.destroy(); // Sets deletedAt (soft delete)
  return ApiResponse.success(res, 200, "Building deleted successfully.");
});
