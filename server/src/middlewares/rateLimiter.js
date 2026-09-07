/**
 * middlewares/rateLimiter.js — API Rate Limiting
 *
 * Protects the API from brute-force attacks and abuse.
 * Using express-rate-limit.
 *
 * Separate limiters for:
 * - Auth endpoints (strict: 10 requests / 15 min)
 * - General API (lenient: 100 requests / 15 min)
 */

import rateLimit from "express-rate-limit";

/**
 * authLimiter — Strict limiter for login/signup endpoints
 * Prevents brute-force password attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // Max 10 login attempts per IP per 15 min
  message: {
    success: false,
    message: "Too many login attempts. Please wait 15 minutes and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * apiLimiter — General limiter for all API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // Max 200 requests per IP
  message: {
    success: false,
    message: "Too many requests. Please slow down and try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default apiLimiter;