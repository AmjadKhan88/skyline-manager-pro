/**
 * shared/middlewares/validate.middleware.js — Joi Validation Middleware
 *
 * Usage:
 *   import { validateBody } from '../../shared/middlewares/validate.middleware.js';
 *   import { loginSchema } from './auth.validator.js';
 *   router.post('/login', validateBody(loginSchema), loginController);
 */

/**
 * validateBody — Validates req.body against a Joi schema.
 * Strips unknown keys and returns validated/coerced data back to req.body.
 */
export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message.replace(/['"]/g, ""));
    return res.status(400).json({
      success: false,
      message: messages[0],
      errors: messages,
    });
  }

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
    convert: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message.replace(/['"]/g, ""));
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }

  req.query = value;
  next();
};

// Backward compatibility alias
export const validate = validateBody;