/**
 * middlewares/validate.middleware.js — Unified Validation Middleware
 *
 * Supports BOTH Joi schemas (new, used by auth.validator.js)
 * and Yup schemas (existing) for backward compatibility.
 *
 * Usage with Joi:
 *   import { validateBody } from '../middlewares/validate.middleware.js';
 *   import { loginSchema } from '../validators/auth.validator.js';
 *   router.post('/login', validateBody(loginSchema), loginController);
 */

import Joi from 'joi';

/**
 * validateBody — Validates req.body against a Joi schema.
 * Strips unknown keys and returns validated/coerced data back to req.body.
 *
 * @param {Joi.Schema} schema - Joi schema to validate against
 */
export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,  // Return ALL validation errors, not just the first
    stripUnknown: true, // Remove keys not in schema (security)
  });

  if (error) {
    const messages = error.details.map((d) => d.message.replace(/['"]/g, ''));
    return res.status(400).json({
      success: false,
      message: messages[0], // Primary error message
      errors: messages,      // All validation errors
    });
  }

  // Replace req.body with validated+sanitized data
  req.body = value;
  next();
};

/**
 * validateQuery — Validates req.query against a Joi schema.
 */
export const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true, // Convert strings to numbers for query params
  });

  if (error) {
    const messages = error.details.map((d) => d.message.replace(/['"]/g, ''));
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }

  req.query = value;
  next();
};

// Backward compatibility alias (for old yup-style usage)
export const validate = validateBody;