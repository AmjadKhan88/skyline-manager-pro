/**
 * services/auth.service.js — Authentication Business Logic
 *
 * Centralizes all JWT and cookie operations so controllers
 * don't deal with token generation directly.
 */

import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

/**
 * generateToken — Create a signed JWT for a user
 * @param {string} userId - The user's UUID
 * @param {string} expiresIn - Token expiry (default 7 days)
 * @returns {string} Signed JWT string
 */
export const generateToken = (userId, expiresIn = "7d") => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * setCookieToken — Attach the JWT as an httpOnly cookie on the response
 *
 * Cookie settings:
 * - httpOnly: true  → JS cannot read it (XSS protection)
 * - secure: true    → HTTPS only in production
 * - sameSite: 'none' in prod (cross-origin SaaS), 'lax' in dev
 * - maxAge: 7 days  → matches JWT expiry
 *
 * @param {object} res - Express response object
 * @param {string} token - JWT string
 */
export const setCookieToken = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

/**
 * clearCookieToken — Remove the auth cookie on logout
 * Must use the SAME options as setCookieToken for the clear to work.
 *
 * @param {object} res - Express response object
 */
export const clearCookieToken = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};

/**
 * generateVerificationToken — Short-lived token for email verification
 * @param {string} userId
 * @returns {string} Signed JWT, expires in 1 hour
 */
export const generateVerificationToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_FOR_VERIFICATION,
    { expiresIn: "1h" }
  );
};

/**
 * generateTempPassword — Create a random 10-character temp password
 * Used when owner creates a new staff member and sends credentials.
 * Format: 4 uppercase letters + 2 digits + 4 random chars
 *
 * @returns {string} Plain-text temporary password (hash before storing!)
 */
export const generateTempPassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};
