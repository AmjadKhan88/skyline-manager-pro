/**
 * features/payments/paymentSubmission.controller.js
 *
 * Tenant submits a payment claim with proof; owner/manager review it.
 * Approval automatically flips the related Tenancy.paymentStatus to 'paid' —
 * this is the one real integration point with the existing Financial/Tenants
 * pages, so approved payments show up everywhere immediately, not just here.
 */
import { Op } from "sequelize";
import {
  PaymentSubmission,
  PaymentAccount,
  Tenancy,
  Building,
  User,
  RentCharge,
} from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import { recomputeChargeStatus } from "../billing/billing.service.js";

const PERSON_ATTRS = ["id", "name", "email"];

// ─── CREATE (tenant submits proof) ──────────────────────────────────────────────
export const createSubmission = asyncHandler(async (req, res) => {
  if (!req.file)
    return ApiResponse.error(
      res,
      400,
      "A payment proof screenshot is required.",
    );

  const {
    tenancyId,
    rentChargeId,
    paymentAccountId,
    amount,
    periodMonth,
    transactionReference,
  } = req.body;

  const tenancy = await Tenancy.findOne({
    where: { id: tenancyId, tenantId: req.user.id },
  });
  if (!tenancy) return ApiResponse.error(res, 403, "This isn't your lease.");

  const account = await PaymentAccount.findOne({
    where: { id: paymentAccountId, ownerId: req.scopedOwnerId, isActive: true },
  });
  if (!account)
    return ApiResponse.error(res, 400, "Invalid or inactive payment account.");

  const submission = await PaymentSubmission.create({
    ownerId: req.scopedOwnerId,
    tenancyId,
    rentChargeId,
    tenantId: req.user.id,
    paymentAccountId,
    method: account.method,
    amount,
    periodMonth: periodMonth || null,
    transactionReference: transactionReference || null,
    proofImageUrl: req.file.path,
    status: "pending",
  });

  return ApiResponse.success(res, 201, "Payment submitted for review.", {
    submission,
  });
});

// ─── LIST (role-scoped) ─────────────────────────────────────────────────────────
export const getAllSubmissions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  const where = { ownerId: req.scopedOwnerId };
  if (status) where.status = status;

  if (req.user.role === "tenant") {
    where.tenantId = req.user.id;
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
    where.tenancyId = { [Op.in]: buildingTenancies.map((t) => t.id) };
  }

  // (Op.in needs a real import — see note below the code block)
  const { count, rows } = await PaymentSubmission.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
    include: [
      { model: User, as: "tenant", attributes: PERSON_ATTRS },
      {
        model: User,
        as: "reviewedBy",
        attributes: PERSON_ATTRS,
        required: false,
      },
      {
        model: Tenancy,
        as: "tenancy",
        attributes: ["id", "unitNumber", "monthlyRent"],
        include: [
          { model: Building, as: "building", attributes: ["id", "name"] },
        ],
      },
      {
        model: PaymentAccount,
        as: "paymentAccount",
        attributes: ["id", "label", "method"],
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
    "Payment submissions fetched.",
  );
});

// ─── REVIEW (approve/reject) ────────────────────────────────────────────────────
export const reviewSubmission = asyncHandler(async (req, res) => {
  const { status, reviewNotes } = req.body;

  const submission = await PaymentSubmission.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!submission) return ApiResponse.error(res, 404, "Submission not found.");

  if (submission.status !== "pending") {
    return ApiResponse.error(
      res,
      400,
      "This submission has already been reviewed.",
    );
  }

  submission.status = status;
  submission.reviewNotes = reviewNotes || null;
  submission.reviewedById = req.user.id;
  submission.reviewedAt = new Date();
  await submission.save();

  if (status === "approved") {
    if (submission.rentChargeId) {
      const charge = await RentCharge.findByPk(submission.rentChargeId);
      if (charge) {
        charge.amountPaid =
          Number(charge.amountPaid) + Number(submission.amount);
        await charge.save();
        await recomputeChargeStatus(charge.id);
      }
    } else {
      // Backward-compat path for submissions made before RentCharge existed
      const tenancy = await Tenancy.findByPk(submission.tenancyId);
      if (tenancy) {
        tenancy.paymentStatus = "paid";
        await tenancy.save();
      }
    }
  }

  return ApiResponse.success(res, 200, `Payment ${status}.`, { submission });
});
