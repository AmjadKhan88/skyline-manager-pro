/**
 * features/signatures/signature.controller.js
 *
 * Signatures are append-only — no update or delete endpoint exists on purpose.
 * A unique (tenancyId, signerId) index backs this up at the DB level: the same
 * person can't sign the same tenancy twice, and a signature once created is
 * permanent, which is the correct behavior for an audit trail, not a missing feature.
 */

import { LeaseSignature, Tenancy, Building, User } from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";

const SIGNER_ATTRS = ["id", "name", "role"];

export const createSignature = asyncHandler(async (req, res) => {
  if (!req.file)
    return ApiResponse.error(res, 400, "A drawn signature image is required.");

  const { tenancyId, typedName } = req.body;

  const tenancy = await Tenancy.findOne({
    where: { id: tenancyId, ownerId: req.scopedOwnerId },
  });
  if (!tenancy) return ApiResponse.error(res, 400, "Invalid tenancy.");

  if (req.user.role === "tenant" && tenancy.tenantId !== req.user.id) {
    return ApiResponse.error(res, 403, "This isn't your lease to sign.");
  }
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

  const existing = await LeaseSignature.findOne({
    where: { tenancyId, signerId: req.user.id },
  });
  if (existing)
    return ApiResponse.error(res, 400, "You've already signed this lease.");

  const signature = await LeaseSignature.create({
    ownerId: req.scopedOwnerId,
    tenancyId,
    signerId: req.user.id,
    signerRole: req.user.role,
    signatureImageUrl: req.file.path,
    typedName,
    ipAddress: req.ip,
    agreedAt: new Date(),
  });

  return ApiResponse.success(res, 201, "Lease signed.", { signature });
});

export const getSignaturesForTenancy = asyncHandler(async (req, res) => {
  const { tenancyId } = req.params;

  const tenancy = await Tenancy.findOne({
    where: { id: tenancyId, ownerId: req.scopedOwnerId },
  });
  if (!tenancy) return ApiResponse.error(res, 404, "Tenancy not found.");

  if (req.user.role === "tenant" && tenancy.tenantId !== req.user.id) {
    return ApiResponse.error(res, 403, "This isn't your lease.");
  }
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

  const signatures = await LeaseSignature.findAll({
    where: { tenancyId },
    order: [["agreedAt", "ASC"]],
    include: [{ model: User, as: "signer", attributes: SIGNER_ATTRS }],
  });

  const isFullyExecuted =
    signatures.some((s) => s.signerRole === "tenant") &&
    signatures.some(
      (s) => s.signerRole === "owner" || s.signerRole === "manager",
    );

  return ApiResponse.success(res, 200, "Signatures fetched.", {
    signatures,
    isFullyExecuted,
  });
});
