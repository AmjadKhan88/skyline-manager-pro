/**
 * middlewares/errorHandler.js — Global Express Error Handler
 *
 * Catches all errors forwarded via next(error) from asyncHandler.
 * Must be registered LAST in server.js after all routes.
 *
 * Handles:
 * - Sequelize validation errors (400)
 * - Sequelize unique constraint violations (409)
 * - JWT errors (401)
 * - Generic server errors (500)
 */

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  // Sequelize Validation Error (e.g. field too long, invalid enum)
  if (err.name === "SequelizeValidationError") {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors: messages });
  }

  // Sequelize Unique Constraint (e.g. duplicate email)
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0]?.path || "field";
    return res.status(409).json({ success: false, message: `This ${field} is already in use.` });
  }

  // Sequelize Foreign Key error
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({ success: false, message: "Invalid reference: related record not found." });
  }

  // JWT errors (already handled in authenticate, but catch here too)
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid or expired session. Please log in again." });
  }

  // Joi validation errors from validateBody middleware
  if (err.isJoi) {
    return res.status(400).json({ success: false, message: err.details[0].message });
  }

  // Default: 500 Internal Server Error
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "An unexpected error occurred.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
