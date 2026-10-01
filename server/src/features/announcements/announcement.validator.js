import Joi from "joi";

export const createAnnouncementSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  body: Joi.string().min(3).required(),
  priority: Joi.string().valid("info", "warning", "urgent"),
  buildingId: Joi.string().uuid().allow(null, ""),
});

export const updateAnnouncementSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  body: Joi.string().min(3),
  priority: Joi.string().valid("info", "warning", "urgent"),
});
