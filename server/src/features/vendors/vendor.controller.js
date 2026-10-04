/**
 * features/vendors/vendor.controller.js
 *
 * Vendors are owner-managed (same reasoning as PaymentAccounts — it's the
 * owner's business relationship with the contractor). Manager can read the
 * active list to assign maintenance requests to one, but can't add/edit/delete.
 */

import { Vendor } from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";

export const createVendor = asyncHandler(async (req, res) => {
  const { name, companyName, phone, email, specialty, notes } = req.body;

  const vendor = await Vendor.create({
    ownerId: req.scopedOwnerId,
    name,
    companyName: companyName || null,
    phone: phone || null,
    email: email || null,
    specialty,
    notes: notes || null,
  });

  return ApiResponse.success(res, 201, "Vendor added.", { vendor });
});

export const getAllVendors = asyncHandler(async (req, res) => {
  const where = { ownerId: req.scopedOwnerId };
  if (req.user.role !== "owner") where.isActive = true;

  const vendors = await Vendor.findAll({ where, order: [["name", "ASC"]] });
  return ApiResponse.success(res, 200, "Vendors fetched.", { vendors });
});

export const updateVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!vendor) return ApiResponse.error(res, 404, "Vendor not found.");

  const fields = [
    "name",
    "companyName",
    "phone",
    "email",
    "specialty",
    "notes",
    "isActive",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) vendor[f] = req.body[f];
  });

  await vendor.save();
  return ApiResponse.success(res, 200, "Vendor updated.", { vendor });
});

export const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!vendor) return ApiResponse.error(res, 404, "Vendor not found.");

  await vendor.destroy();
  return ApiResponse.success(res, 200, "Vendor deleted.");
});
