/**
 * features/documents/document.controller.js
 *
 * Visibility:
 * - owner:   everything in their portfolio
 * - manager: documents tied to their building (buildingId match), or to a tenancy/tenant within it
 * - tenant:  only documents that are specifically theirs (subjectUserId = them, or tenancyId = their own lease)
 *
 * Who can upload:
 * - owner/manager: any category, scoped to their building/portfolio
 * - tenant: only their own id_proof/insurance (self-service — they can't upload a "lease" themselves,
 *   that's something the owner/manager issues)
 */

import { Document, Building, Tenancy, User } from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import { Op } from "sequelize";

const UPLOADER_ATTRS = ["id", "name", "role"];

// ─── UPLOAD ─────────────────────────────────────────────────────────────────────
export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) return ApiResponse.error(res, 400, "A file is required.");

  const { title, buildingId, tenancyId } = req.body;
  let { category, subjectUserId } = req.body;

  if (req.user.role === "tenant") {
    // Tenants may only self-upload id_proof/insurance, tied to themselves
    if (!["id_proof", "insurance"].includes(category)) {
      return ApiResponse.error(
        res,
        403,
        "You can only upload ID or insurance documents.",
      );
    }
    subjectUserId = req.user.id;
  } else if (buildingId) {
    const building = await Building.findOne({
      where: { id: buildingId, ownerId: req.scopedOwnerId },
    });
    if (!building) return ApiResponse.error(res, 400, "Invalid building.");
  }

  const document = await Document.create({
    ownerId: req.scopedOwnerId,
    buildingId: buildingId || null,
    tenancyId: tenancyId || null,
    subjectUserId: subjectUserId || null,
    uploadedById: req.user.id,
    title,
    category,
    fileUrl: req.file.path,
    fileType: req.file.mimetype?.includes("pdf") ? "pdf" : "image",
  });

  return ApiResponse.success(res, 201, "Document uploaded.", { document });
});

// ─── LIST (role-scoped) ─────────────────────────────────────────────────────────
export const getAllDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, buildingId } = req.query;
  const offset = (page - 1) * limit;

  const where = { ownerId: req.scopedOwnerId };
  if (category) where.category = category;

  if (req.user.role === "tenant") {
    const myTenancies = await Tenancy.findAll({
      where: { tenantId: req.user.id },
      attributes: ["id"],
    });
    where[Op.or] = [
      { subjectUserId: req.user.id },
      { tenancyId: { [Op.in]: myTenancies.map((t) => t.id) } },
    ];
  } else if (req.user.role === "manager") {
    const myBuilding = await Building.findOne({
      where: { managerId: req.user.id },
    });
    if (!myBuilding)
      return ApiResponse.paginated(
        res,
        [],
        0,
        page,
        limit,
        "No building assigned yet.",
      );
    const buildingTenancies = await Tenancy.findAll({
      where: { buildingId: myBuilding.id },
      attributes: ["id"],
    });
    where[Op.or] = [
      { buildingId: myBuilding.id },
      { tenancyId: { [Op.in]: buildingTenancies.map((t) => t.id) } },
    ];
  } else if (buildingId) {
    where.buildingId = buildingId;
  }

  const { count, rows } = await Document.findAndCountAll({
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
      {
        model: User,
        as: "subject",
        attributes: UPLOADER_ATTRS,
        required: false,
      },
      { model: User, as: "uploadedBy", attributes: UPLOADER_ATTRS },
    ],
  });

  return ApiResponse.paginated(
    res,
    rows,
    count,
    page,
    limit,
    "Documents fetched.",
  );
});

// ─── DELETE (uploader, or owner for anything in their portfolio) ───────────────
export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!document) return ApiResponse.error(res, 404, "Document not found.");

  if (req.user.role !== "owner" && document.uploadedById !== req.user.id) {
    return ApiResponse.error(
      res,
      403,
      "You can only delete documents you uploaded.",
    );
  }

  await document.destroy();
  return ApiResponse.success(res, 200, "Document deleted.");
});
