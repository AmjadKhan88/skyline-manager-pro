import Joi from "joi";

export const createAccountSchema = Joi.object({
  method: Joi.string()
    .valid("bank_transfer", "jazzcash", "easypaisa", "other")
    .required(),
  label: Joi.string().min(2).max(100).required(),
  accountTitle: Joi.string().min(2).max(150).required(),
  accountNumber: Joi.string().min(3).max(50).required(),
  bankName: Joi.string().allow("", null),
  iban: Joi.string().allow("", null),
  instructions: Joi.string().allow("", null),
});

export const updateAccountSchema = createAccountSchema
  .fork(["method", "label", "accountTitle", "accountNumber"], (s) =>
    s.optional(),
  )
  .keys({ isActive: Joi.boolean() });

export const createSubmissionSchema = Joi.object({
  tenancyId: Joi.string().uuid().required(),
  rentChargeId: Joi.string().uuid().required(),
  paymentAccountId: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  periodMonth: Joi.string().allow("", null),
  transactionReference: Joi.string().allow("", null),
});

export const reviewSubmissionSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),
  reviewNotes: Joi.string().allow("", null),
});
