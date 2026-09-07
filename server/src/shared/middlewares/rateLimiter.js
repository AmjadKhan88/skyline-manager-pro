/**
 * shared/middlewares/rateLimiter.js — API Rate Limiting
 *
 * Separate limiters for:
 * - Auth endpoints (strict: 10 requests / 15 min)
 * - General API (lenient: 200 requests / 15 min)
 */

import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please wait 15 minutes and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many requests. Please slow down and try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default apiLimiter;