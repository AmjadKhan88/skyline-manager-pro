/**
 * features/inspections/inspection.controller.js
 *
 * Visibility/write rules, same pattern as Maintenance/Expenses:
 * - owner:   full portfolio access
 * - manager: only their own building's inspections, creates/edits freely there
 * - tenant:  read-only, only inspections tied to THEIR OWN tenancy, plus the
 *            ability to acknowledge a completed one (their one write action)
 */

import { Inspection, Building, Tenancy, User } from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import { Op } from "sequelize";

const PERSON_ATTRS = ["id", "name", "role"];

export const createInspection = asyncHandler(async (req, res) => {
  const { tenancyId, type, inspectionDate, items, generalNotes, status } =
    req.body;

  const tenancy = await Tenancy.findOne({
    where: { id: tenancyId, ownerId: req.scopedOwnerId },
  });
  if (!tenancy) return ApiResponse.error(res, 400, "Invalid tenancy.");

  if (req.user.role === "manager") {
    const myBuilding = await Building.findOne({
      where: { managerId: req.user.id },
    });
    if (!myBuilding || tenancy.buildingId !== myBuilding.id) {
      return ApiResponse.error(
        res,
        403,
        "This tenancy isn't in your building.",
      );
    }
  }

  const inspection = await Inspection.create({
    ownerId: req.scopedOwnerId,
    buildingId: tenancy.buildingId,
    tenancyId,
    inspectedById: req.user.id,
    type,
    inspectionDate,
    items: items || [],
    generalNotes: generalNotes || null,
    status: status || "draft",
  });

  return ApiResponse.success(res, 201, "Inspection created.", { inspection });
});

export const getAllInspections = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, tenancyId } = req.query;
  const offset = (page - 1) * limit;

  const where = { ownerId: req.scopedOwnerId };
  if (tenancyId) where.tenancyId = tenancyId;

  if (req.user.role === "tenant") {
    const myTenancies = await Tenancy.findAll({
      where: { tenantId: req.user.id },
      attributes: ["id"],
    });
    where.tenancyId = { [Op.in]: myTenancies.map((t) => t.id) };
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
    where.buildingId = myBuilding.id;
  }

  const { count, rows } = await Inspection.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["inspectionDate", "DESC"]],
    include: [
      { model: Building, as: "building", attributes: ["id", "name"] },
      { model: User, as: "inspectedBy", attributes: PERSON_ATTRS },
      {
        model: Tenancy,
        as: "tenancy",
        attributes: ["id", "unitNumber", "tenantId"],
      },
    ],
  });

  return ApiResponse.paginated(
    res,
    rows,
    count,
    page,
    limit,
    "Inspections fetched.",
  );
});

export const updateInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!inspection) return ApiResponse.error(res, 404, "Inspection not found.");

  if (req.user.role !== "owner" && inspection.inspectedById !== req.user.id) {
    return ApiResponse.error(
      res,
      403,
      "You can only edit inspections you conducted.",
    );
  }

  const fields = ["inspectionDate", "items", "generalNotes", "status"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) inspection[f] = req.body[f];
  });

  await inspection.save();
  return ApiResponse.success(res, 200, "Inspection updated.", { inspection });
});

export const acknowledgeInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
    include: [{ model: Tenancy, as: "tenancy", attributes: ["tenantId"] }],
  });
  if (!inspection) return ApiResponse.error(res, 404, "Inspection not found.");
  if (inspection.tenancy.tenantId !== req.user.id) {
    return ApiResponse.error(
      res,
      403,
      "This isn't your inspection to acknowledge.",
    );
  }
  if (inspection.status !== "completed") {
    return ApiResponse.error(res, 400, "This inspection isn't finalized yet.");
  }

  inspection.tenantAcknowledged = true;
  inspection.tenantAcknowledgedAt = new Date();
  await inspection.save();

  return ApiResponse.success(res, 200, "Inspection acknowledged.", {
    inspection,
  });
});

export const deleteInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!inspection) return ApiResponse.error(res, 404, "Inspection not found.");

  if (req.user.role !== "owner" && inspection.inspectedById !== req.user.id) {
    return ApiResponse.error(
      res,
      403,
      "You can only delete inspections you conducted.",
    );
  }

  await inspection.destroy();
  return ApiResponse.success(res, 200, "Inspection deleted.");
});
