import Joi from "joi";

export const updateTenancyBillingSchema = Joi.object({
  billingDueDay: Joi.number().integer().min(1).max(28),
  gracePeriodDays: Joi.number().integer().min(0).max(30),
  lateFeeType: Joi.string().valid("none", "fixed", "percent"),
  lateFeeValue: Joi.number().min(0),
});

export const waiveChargeSchema = Joi.object({
  notes: Joi.string().allow("", null),
});
