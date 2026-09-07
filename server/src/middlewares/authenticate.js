/**
 * authenticate.js — Unified JWT Authentication Middleware
 *
 * REPLACES THREE PREVIOUS MIDDLEWARES:
 * - authMiddleware   (checked Auth table for owners)
 * - userMiddleware   (checked User table for staff)
 * - joinMiddleware   (hack that checked BOTH tables)
 *
 * Now there is ONE table (users) and ONE middleware.
 *
 * HOW IT WORKS:
 * 1. Reads the `token` httpOnly cookie from the request
 * 2. Verifies the JWT signature with JWT_SECRET
 * 3. Looks up the decoded `id` in the unified users table
 * 4. Strips the password field for security
 * 5. Attaches the full user object to `req.user`
 * 6. Calls next() — downstream middleware (authorize, tenantScope) can now use req.user
 *
 * ERROR CASES:
 * - No token → 401 Unauthorized
 * - Invalid/expired JWT → 401 Unauthorized
 * - User not found in DB (deleted?) → 401 Unauthorized
 * - Inactive/pending status → 403 Forbidden (must be active to call APIs)
 *
 * USAGE:
 *   router.get('/protected', authenticate, authorize('owner'), handler)
 */

import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const authenticate = async (req, res, next) => {
  try {
    // Extract token from httpOnly cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // Verify signature and decode payload
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // Distinguish between expired and invalid tokens for better error messages
      const message =
        jwtError.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid authentication token.";
      return res.status(401).json({ success: false, message });
    }

    // Look up user in the unified users table
    const user = await User.findOne({
      where: { id: decoded.id },
      // Include profile based on role (handled in tenantScope or specific controllers)
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found. Please contact support.",
      });
    }

    // Prevent deactivated users from accessing the API
    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact your building owner.",
      });
    }

    // Remove sensitive data before attaching to request
    user.password = undefined;

    // Attach user to request — downstream middleware and controllers use req.user
    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication error. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
