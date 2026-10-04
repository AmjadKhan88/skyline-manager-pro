import Joi from "joi";

export const createVendorSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  companyName: Joi.string().allow("", null),
  phone: Joi.string().allow("", null),
  email: Joi.string().email().allow("", null),
  specialty: Joi.string().valid(
    "plumbing",
    "electrical",
    "hvac",
    "appliance",
    "structural",
    "pest-control",
    "general",
  ),
  notes: Joi.string().allow("", null),
});

export const updateVendorSchema = createVendorSchema
  .fork(["name"], (s) => s.optional())
  .keys({
    isActive: Joi.boolean(),
  });
