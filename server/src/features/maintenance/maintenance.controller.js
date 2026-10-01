/**
 * features/maintenance/maintenance.controller.js
 *
 * Visibility rules (this is the part that matters most here):
 * - owner:    sees every request across their whole portfolio
 * - manager:  sees only requests for the one building they manage
 * - employee: sees requests for their building, PLUS anything assigned to them
 * - tenant:   sees only requests they personally submitted
 */

import {
  MaintenanceRequest,
  Building,
  User,
  UserProfile,
} from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import { Op } from "sequelize";

const STAFF_ATTRS = ["id", "name", "email", "role"];

// ─── CREATE (tenant or employee reports an issue) ──────────────────────────────
export const createRequest = asyncHandler(async (req, res) => {
  const { title, description, category, priority, unitNumber, buildingId } =
    req.body;

  const building = await Building.findOne({
    where: { id: buildingId, ownerId: req.scopedOwnerId },
  });
  if (!building) return ApiResponse.error(res, 400, "Invalid building.");

  const request = await MaintenanceRequest.create({
    ownerId: req.scopedOwnerId,
    buildingId,
    reportedById: req.user.id,
    title,
    description,
    category,
    priority,
    unitNumber,
    photoUrl: req.file?.path || null,
  });

  return ApiResponse.success(res, 201, "Maintenance request submitted.", {
    request,
  });
});

// ─── LIST (role-scoped visibility) ─────────────────────────────────────────────
export const getAllRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, buildingId } = req.query;
  const offset = (page - 1) * limit;

  const where = { ownerId: req.scopedOwnerId };
  if (status) where.status = status;
  if (priority) where.priority = priority;

  if (req.user.role === "tenant") {
    where.reportedById = req.user.id;
  } else if (req.user.role === "manager" || req.user.role === "employee") {
    const myBuilding = await Building.findOne({
      where:
        req.user.role === "manager"
          ? { managerId: req.user.id }
          : { ownerId: req.scopedOwnerId },
    });
    // Employees aren't tied to a building via Building.managerId — resolve via their UserProfile instead
    if (req.user.role === "employee") {
      const profile = await UserProfile.findOne({
        where: { userId: req.user.id },
      });
      if (!profile?.buildingId) {
        return ApiResponse.paginated(
          res,
          [],
          0,
          page,
          limit,
          "No building assigned yet.",
        );
      }
      where[Op.or] = [
        { buildingId: profile.buildingId },
        { assignedToId: req.user.id },
      ];
    } else {
      if (!myBuilding)
        return ApiResponse.paginated(
          res,
          [],
          0,
          page,
          limit,
          "No building assigned yet.",
        );
      where.buildingId = myBuilding.id;
    }
  } else if (buildingId) {
    // owner optionally filters by a specific building
    where.buildingId = buildingId;
  }

  const { count, rows } = await MaintenanceRequest.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Building,
        as: "building",
        attributes: ["id", "name", "address"],
      },
      { model: User, as: "reportedBy", attributes: STAFF_ATTRS },
      {
        model: User,
        as: "assignedTo",
        attributes: STAFF_ATTRS,
        required: false,
      },
    ],
  });

  return ApiResponse.paginated(
    res,
    rows,
    count,
    page,
    limit,
    "Maintenance requests fetched.",
  );
});

// ─── GET ONE ────────────────────────────────────────────────────────────────────
export const getRequestById = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
    include: [
      {
        model: Building,
        as: "building",
        attributes: ["id", "name", "address"],
      },
      { model: User, as: "reportedBy", attributes: STAFF_ATTRS },
      {
        model: User,
        as: "assignedTo",
        attributes: STAFF_ATTRS,
        required: false,
      },
    ],
  });

  if (!request) return ApiResponse.error(res, 404, "Request not found.");

  // A tenant may only view their own request
  if (req.user.role === "tenant" && request.reportedById !== req.user.id) {
    return ApiResponse.error(res, 403, "You can only view your own requests.");
  }

  return ApiResponse.success(res, 200, "Request fetched.", { request });
});

// ─── ASSIGN (owner/manager assigns to a staff member) ──────────────────────────
export const assignRequest = asyncHandler(async (req, res) => {
  const { assignedToId } = req.body;

  const request = await MaintenanceRequest.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!request) return ApiResponse.error(res, 404, "Request not found.");

  const assignee = await User.findOne({
    where: {
      id: assignedToId,
      ownerId: req.scopedOwnerId,
      role: { [Op.in]: ["manager", "employee"] },
    },
  });
  if (!assignee) return ApiResponse.error(res, 400, "Invalid assignee.");

  request.assignedToId = assignedToId;
  if (request.status === "open") request.status = "in-progress";
  await request.save();

  return ApiResponse.success(res, 200, "Request assigned.", { request });
});

// ─── UPDATE STATUS ──────────────────────────────────────────────────────────────
export const updateStatus = asyncHandler(async (req, res) => {
  const { status, resolutionNotes } = req.body;

  const request = await MaintenanceRequest.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!request) return ApiResponse.error(res, 404, "Request not found.");

  // An employee may only update requests assigned to them; owner/manager can update any
  if (req.user.role === "employee" && request.assignedToId !== req.user.id) {
    return ApiResponse.error(
      res,
      403,
      "You can only update requests assigned to you.",
    );
  }

  request.status = status;
  if (resolutionNotes !== undefined) request.resolutionNotes = resolutionNotes;
  if (status === "resolved") request.resolvedAt = new Date();

  await request.save();
  return ApiResponse.success(res, 200, "Status updated.", { request });
});

// ─── DELETE (owner/manager only) ────────────────────────────────────────────────
export const deleteRequest = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!request) return ApiResponse.error(res, 404, "Request not found.");

  await request.destroy();
  return ApiResponse.success(res, 200, "Request deleted.");
});
