import Joi from "joi";

export const createDocumentSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  category: Joi.string().valid(
    "lease",
    "id_proof",
    "insurance",
    "inspection",
    "permit",
    "financial",
    "other",
  ),
  buildingId: Joi.string().uuid().allow(null, ""),
  tenancyId: Joi.string().uuid().allow(null, ""),
  subjectUserId: Joi.string().uuid().allow(null, ""),
});
