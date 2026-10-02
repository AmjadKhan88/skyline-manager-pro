/**
 * features/payments/paymentAccount.controller.js
 *
 * Owner manages their own receiving accounts (bank/JazzCash/EasyPaisa).
 * Manager and tenant can only READ the active ones — they need to see
 * where to send money, but never create/edit/delete an owner's accounts.
 */

import { PaymentAccount } from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";

export const createAccount = asyncHandler(async (req, res) => {
  const {
    method,
    label,
    accountTitle,
    accountNumber,
    bankName,
    iban,
    instructions,
  } = req.body;

  const account = await PaymentAccount.create({
    ownerId: req.scopedOwnerId,
    method,
    label,
    accountTitle,
    accountNumber,
    bankName: bankName || null,
    iban: iban || null,
    instructions: instructions || null,
    qrCodeUrl: req.file?.path || null,
  });

  return ApiResponse.success(res, 201, "Payment account added.", { account });
});

export const getAllAccounts = asyncHandler(async (req, res) => {
  const where = { ownerId: req.scopedOwnerId };
  // Non-owners should only ever see active accounts — an owner can see everything,
  // including ones they've deactivated, so they can reactivate later.
  if (req.user.role !== "owner") where.isActive = true;

  const accounts = await PaymentAccount.findAll({
    where,
    order: [["createdAt", "ASC"]],
  });
  return ApiResponse.success(res, 200, "Payment accounts fetched.", {
    accounts,
  });
});

export const updateAccount = asyncHandler(async (req, res) => {
  const account = await PaymentAccount.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!account) return ApiResponse.error(res, 404, "Account not found.");

  const fields = [
    "method",
    "label",
    "accountTitle",
    "accountNumber",
    "bankName",
    "iban",
    "instructions",
    "isActive",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) account[f] = req.body[f];
  });
  if (req.file?.path) account.qrCodeUrl = req.file.path;

  await account.save();
  return ApiResponse.success(res, 200, "Payment account updated.", { account });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const account = await PaymentAccount.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!account) return ApiResponse.error(res, 404, "Account not found.");

  await account.destroy();
  return ApiResponse.success(res, 200, "Payment account deleted.");
});
