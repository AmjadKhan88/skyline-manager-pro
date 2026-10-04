import Joi from "joi";

export const createRequestSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().allow("", null),
  category: Joi.string().valid(
    "plumbing",
    "electrical",
    "hvac",
    "appliance",
    "structural",
    "pest-control",
    "other",
  ),
  priority: Joi.string().valid("low", "medium", "high", "urgent"),
  unitNumber: Joi.string().allow("", null),
  buildingId: Joi.string().uuid().required(),
});

export const assignRequestSchema = Joi.object({
  assignedToId: Joi.string().uuid().allow(null, ""),
  assignedVendorId: Joi.string().uuid().allow(null, ""),
}).xor("assignedToId", "assignedVendorId"); // exactly one must be provided, not both

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("open", "in-progress", "resolved", "cancelled")
    .required(),
  resolutionNotes: Joi.string().allow("", null),
});
