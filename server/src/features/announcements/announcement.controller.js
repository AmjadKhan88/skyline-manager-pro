/**
 * features/announcements/announcement.controller.js
 *
 * Visibility:
 * - owner:    sees everything they've posted across their portfolio
 * - manager:  sees portfolio-wide ones (buildingId null) + their own building's
 * - employee: sees portfolio-wide + their building's (via UserProfile.buildingId)
 * - tenant:   sees portfolio-wide + their building's (via active Tenancy.buildingId)
 *
 * Who can post:
 * - owner:   any building, or null for portfolio-wide
 * - manager: only their own building — buildingId is forced server-side, not trusted from the client
 */

import {
  Announcement,
  Building,
  User,
  UserProfile,
  Tenancy,
} from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import { Op } from "sequelize";

const AUTHOR_ATTRS = ["id", "name", "role"];

const resolveViewerBuildingId = async (req) => {
  if (req.user.role === "employee") {
    const profile = await UserProfile.findOne({
      where: { userId: req.user.id },
    });
    return profile?.buildingId || null;
  }
  if (req.user.role === "tenant") {
    const tenancy = await Tenancy.findOne({
      where: { tenantId: req.user.id, status: "active" },
    });
    return tenancy?.buildingId || null;
  }
  return null;
};

// ─── CREATE ─────────────────────────────────────────────────────────────────
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, body, priority } = req.body;
  let { buildingId } = req.body;

  if (req.user.role === "manager") {
    // Managers can only ever post to their own building — ignore whatever client sent
    const myBuilding = await Building.findOne({
      where: { managerId: req.user.id },
    });
    if (!myBuilding)
      return ApiResponse.error(
        res,
        400,
        "You're not assigned to a building yet.",
      );
    buildingId = myBuilding.id;
  } else if (buildingId) {
    const building = await Building.findOne({
      where: { id: buildingId, ownerId: req.scopedOwnerId },
    });
    if (!building) return ApiResponse.error(res, 400, "Invalid building.");
  } else {
    buildingId = null; // owner posting portfolio-wide
  }

  const announcement = await Announcement.create({
    ownerId: req.scopedOwnerId,
    buildingId,
    authorId: req.user.id,
    title,
    body,
    priority,
  });

  return ApiResponse.success(res, 201, "Announcement posted.", {
    announcement,
  });
});

// ─── LIST (role-scoped visibility) ─────────────────────────────────────────────
export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, buildingId } = req.query;
  const offset = (page - 1) * limit;

  const where = { ownerId: req.scopedOwnerId };

  if (req.user.role === "owner") {
    if (buildingId) where.buildingId = buildingId;
  } else if (req.user.role === "manager") {
    const myBuilding = await Building.findOne({
      where: { managerId: req.user.id },
    });
    where[Op.or] = [
      { buildingId: null },
      { buildingId: myBuilding?.id || null },
    ];
  } else {
    const viewerBuildingId = await resolveViewerBuildingId(req);
    where[Op.or] = [{ buildingId: null }, { buildingId: viewerBuildingId }];
  }

  const { count, rows } = await Announcement.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Building,
        as: "building",
        attributes: ["id", "name"],
        required: false,
      },
      { model: User, as: "author", attributes: AUTHOR_ATTRS },
    ],
  });

  return ApiResponse.paginated(
    res,
    rows,
    count,
    page,
    limit,
    "Announcements fetched.",
  );
});

// ─── UPDATE (author only) ───────────────────────────────────────────────────────
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!announcement)
    return ApiResponse.error(res, 404, "Announcement not found.");

  if (announcement.authorId !== req.user.id) {
    return ApiResponse.error(
      res,
      403,
      "You can only edit announcements you posted.",
    );
  }

  const { title, body, priority } = req.body;
  if (title !== undefined) announcement.title = title;
  if (body !== undefined) announcement.body = body;
  if (priority !== undefined) announcement.priority = priority;
  await announcement.save();

  return ApiResponse.success(res, 200, "Announcement updated.", {
    announcement,
  });
});

// ─── DELETE (author, or owner can delete any in their portfolio) ──────────────
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!announcement)
    return ApiResponse.error(res, 404, "Announcement not found.");

  if (req.user.role !== "owner" && announcement.authorId !== req.user.id) {
    return ApiResponse.error(
      res,
      403,
      "You can only delete announcements you posted.",
    );
  }

  await announcement.destroy();
  return ApiResponse.success(res, 200, "Announcement deleted.");
});
