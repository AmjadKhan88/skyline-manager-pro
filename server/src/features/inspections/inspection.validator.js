import Joi from "joi";

const itemSchema = Joi.object({
  area: Joi.string().required(),
  item: Joi.string().required(),
  condition: Joi.string()
    .valid("excellent", "good", "fair", "poor", "damaged", "not_applicable")
    .required(),
  notes: Joi.string().allow("", null),
  photoUrl: Joi.string().allow("", null),
});

export const createInspectionSchema = Joi.object({
  tenancyId: Joi.string().uuid().required(),
  type: Joi.string().valid("move_in", "move_out").required(),
  inspectionDate: Joi.string().required(),
  items: Joi.array().items(itemSchema).default([]),
  generalNotes: Joi.string().allow("", null),
  status: Joi.string().valid("draft", "completed"),
});

export const updateInspectionSchema = Joi.object({
  inspectionDate: Joi.string(),
  items: Joi.array().items(itemSchema),
  generalNotes: Joi.string().allow("", null),
  status: Joi.string().valid("draft", "completed"),
});
