/**
 * shared/middlewares/errorHandler.js — Global Express Error Handler
 *
 * Catches all errors forwarded via next(error) from asyncHandler.
 * Must be registered LAST in server.js after all routes.
 */

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  if (err.name === "SequelizeValidationError") {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors: messages });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0]?.path || "field";
    return res.status(409).json({ success: false, message: `This ${field} is already in use.` });
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({ success: false, message: "Invalid reference: related record not found." });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid or expired session. Please log in again." });
  }

  if (err.isJoi) {
    return res.status(400).json({ success: false, message: err.details[0].message });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "An unexpected error occurred.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;