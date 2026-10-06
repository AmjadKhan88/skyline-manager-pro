import { RentCharge, Tenancy, Building, User } from "../../models/index.js";
import { generateMissingCharges, applyLateFees } from "./billing.service.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import { Op } from "sequelize";
// ─── GET RENT ROLL (role-scoped) ───────────────────────────────────────────────
export const getRentRoll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, tenancyId } = req.query;
  const offset = (page - 1) * limit;

  const where = { ownerId: req.scopedOwnerId };
  if (status) where.status = status;
  if (tenancyId) where.tenancyId = tenancyId;

  if (req.user.role === "manager") {
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
  } else if (req.user.role === "tenant") {
    const myTenancies = await Tenancy.findAll({
      where: { tenantId: req.user.id },
      attributes: ["id"],
    });
    where.tenancyId = { [Op.in]: myTenancies.map((t) => t.id) };
  }

  const { count, rows } = await RentCharge.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["periodMonth", "DESC"]],
    include: [
      { model: Building, as: "building", attributes: ["id", "name"] },
      {
        model: Tenancy,
        as: "tenancy",
        attributes: ["id", "unitNumber", "tenantId"],
        include: [
          { model: User, as: "tenant", attributes: ["id", "name", "email"] },
        ],
      },
    ],
  });

  return ApiResponse.paginated(
    res,
    rows,
    count,
    page,
    limit,
    "Rent roll fetched.",
  );
});

// ─── UPDATE BILLING CONFIG on a tenancy ────────────────────────────────────────
export const updateTenancyBilling = asyncHandler(async (req, res) => {
  const tenancy = await Tenancy.findOne({
    where: { id: req.params.tenancyId, ownerId: req.scopedOwnerId },
  });
  if (!tenancy) return ApiResponse.error(res, 404, "Tenancy not found.");

  const fields = [
    "billingDueDay",
    "gracePeriodDays",
    "lateFeeType",
    "lateFeeValue",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) tenancy[f] = req.body[f];
  });
  await tenancy.save();

  return ApiResponse.success(res, 200, "Billing settings updated.", {
    tenancy,
  });
});

// ─── WAIVE a charge (owner/manager forgives a late fee or whole charge) ───────
export const waiveCharge = asyncHandler(async (req, res) => {
  const charge = await RentCharge.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!charge) return ApiResponse.error(res, 404, "Charge not found.");

  charge.status = "waived";
  charge.notes = req.body.notes || charge.notes;
  await charge.save();

  return ApiResponse.success(res, 200, "Charge waived.", { charge });
});

// ─── MANUAL TRIGGER (owner can force-run generation, e.g. for testing or a missed day) ─
export const runBillingCycle = asyncHandler(async (req, res) => {
  const created = await generateMissingCharges();
  const feesApplied = await applyLateFees();
  return ApiResponse.success(res, 200, "Billing cycle run.", {
    chargesCreated: created,
    lateFeesApplied: feesApplied,
  });
});
