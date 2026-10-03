/**
 * features/expenses/expense.controller.js
 *
 * Visibility/write rules, same pattern as Announcements/Maintenance:
 * - owner:   full access across their portfolio, any building
 * - manager: only their own building — buildingId is forced server-side on
 *            create, and they can only edit/delete expenses THEY recorded
 *            (an owner's own entries for that building stay owner-only to edit)
 */

import { Expense, Building, User } from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";

const RECORDER_ATTRS = ["id", "name", "role"];

export const createExpense = asyncHandler(async (req, res) => {
  const { category, description, vendor, amount, expenseDate } = req.body;
  let { buildingId } = req.body;

  if (req.user.role === "manager") {
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
  } else {
    const building = await Building.findOne({
      where: { id: buildingId, ownerId: req.scopedOwnerId },
    });
    if (!building) return ApiResponse.error(res, 400, "Invalid building.");
  }

  const expense = await Expense.create({
    ownerId: req.scopedOwnerId,
    buildingId,
    recordedById: req.user.id,
    category,
    description,
    vendor: vendor || null,
    amount,
    expenseDate,
    receiptUrl: req.file?.path || null,
  });

  return ApiResponse.success(res, 201, "Expense recorded.", { expense });
});

export const getAllExpenses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, buildingId, category } = req.query;
  const offset = (page - 1) * limit;

  const where = { ownerId: req.scopedOwnerId };
  if (category) where.category = category;

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
  } else if (buildingId) {
    where.buildingId = buildingId;
  }

  const { count, rows } = await Expense.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["expenseDate", "DESC"]],
    include: [
      { model: Building, as: "building", attributes: ["id", "name"] },
      { model: User, as: "recordedBy", attributes: RECORDER_ATTRS },
    ],
  });

  return ApiResponse.paginated(
    res,
    rows,
    count,
    page,
    limit,
    "Expenses fetched.",
  );
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!expense) return ApiResponse.error(res, 404, "Expense not found.");

  if (req.user.role !== "owner" && expense.recordedById !== req.user.id) {
    return ApiResponse.error(
      res,
      403,
      "You can only edit expenses you recorded.",
    );
  }

  const fields = ["category", "description", "vendor", "amount", "expenseDate"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) expense[f] = req.body[f];
  });
  if (req.file?.path) expense.receiptUrl = req.file.path;

  await expense.save();
  return ApiResponse.success(res, 200, "Expense updated.", { expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    where: { id: req.params.id, ownerId: req.scopedOwnerId },
  });
  if (!expense) return ApiResponse.error(res, 404, "Expense not found.");

  if (req.user.role !== "owner" && expense.recordedById !== req.user.id) {
    return ApiResponse.error(
      res,
      403,
      "You can only delete expenses you recorded.",
    );
  }

  await expense.destroy();
  return ApiResponse.success(res, 200, "Expense deleted.");
});
