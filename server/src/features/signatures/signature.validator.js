import Joi from "joi";

export const createSignatureSchema = Joi.object({
  tenancyId: Joi.string().uuid().required(),
  typedName: Joi.string().min(2).max(150).required(),
  agreed: Joi.boolean().valid(true).required().messages({
    "any.only": "You must agree to the lease terms before signing.",
  }),
});
