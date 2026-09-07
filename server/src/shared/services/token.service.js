/**
 * shared/services/token.service.js — JWT & Cookie Helpers
 *
 * Centralizes all JWT and cookie operations so controllers
 * don't deal with token generation directly.
 */

import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

/**
 * generateToken — Create a signed JWT for a user
 */
export const generateToken = (userId, expiresIn = "7d") => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * setCookieToken — Attach the JWT as an httpOnly cookie on the response
 */
export const setCookieToken = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * clearCookieToken — Remove the auth cookie on logout
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
 */
export const generateVerificationToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_FOR_VERIFICATION,
    { expiresIn: "1h" }
  );
};

/**
 * generateTempPassword — Create a random 12-character temp password
 * Used when owner creates a new staff member and sends credentials.
 */
export const generateTempPassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};