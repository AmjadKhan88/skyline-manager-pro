import Joi from "joi";

export const createExpenseSchema = Joi.object({
  buildingId: Joi.string().uuid().required(),
  category: Joi.string().valid(
    "maintenance",
    "utilities",
    "salary",
    "insurance",
    "tax",
    "repairs",
    "supplies",
    "other",
  ),
  description: Joi.string().min(2).max(300).required(),
  vendor: Joi.string().allow("", null),
  amount: Joi.number().positive().required(),
  expenseDate: Joi.string().required(),
});

export const updateExpenseSchema = createExpenseSchema.fork(
  ["buildingId", "description", "amount", "expenseDate"],
  (s) => s.optional(),
);
