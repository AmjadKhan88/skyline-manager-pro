/**
 * controllers/auth.controller.js — Authentication Controller
 *
 * Handles signup (owners only), universal login (all roles),
 * logout, email verification, and profile check.
 *
 * IMPORTANT: Only owners self-register. All other roles (manager, employee, tenant)
 * are created BY the owner via staff.controller or tenant.controller.
 */

import { User, OwnerProfile } from "../models/index.js";
import {
  generateToken,
  setCookieToken,
  clearCookieToken,
  generateVerificationToken,
} from "../services/auth.service.js";
import { sendEmailVerification } from "../services/email.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// ─── SIGNUP (Owner Registration) ──────────────────────────────────────────────
/**
 * POST /api/v1/auth/signup
 * Public route — creates a new owner account.
 * Only owners self-register; staff are invited by owners.
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check email uniqueness across the unified users table
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return ApiResponse.error(res, 400, "An account with this email already exists.");
  }

  // Create owner user (password hashed by beforeCreate hook)
  const user = await User.create({
    name,
    email,
    password,
    role: "owner",
    status: "active",
    verified: false,
    ownerId: null, // Owners have no parent owner
  });

  // Create default OwnerProfile
  await OwnerProfile.create({
    userId: user.id,
    subscriptionPlan: "basic",
    maxBuildings: 3,
  });

  // Issue JWT and set cookie
  const token = generateToken(user.id);
  setCookieToken(res, token);

  user.password = undefined;
  return ApiResponse.success(res, 201, "Account created successfully. Please verify your email.", { user });
});

// ─── LOGIN (Universal — All Roles) ────────────────────────────────────────────
/**
 * POST /api/v1/auth/login
 * Public route — handles login for ALL roles: owner, manager, employee, tenant.
 * Returns the user's role so the frontend can redirect to the correct dashboard.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user in unified table
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return ApiResponse.error(res, 401, "No account found with this email address.");
  }

  // Prevent inactive users from logging in
  if (user.status === "inactive") {
    return ApiResponse.error(res, 403, "Your account has been deactivated. Please contact your building owner.");
  }

  // Handle Google OAuth users who have no password
  if (user.googleId && !user.password) {
    return ApiResponse.error(res, 400, "This account uses Google Sign-In. Please log in with Google.");
  }

  // Verify password using instance method (defined on User model)
  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return ApiResponse.error(res, 401, "Incorrect password. Please try again.");
  }

  // Activate 'pending' staff on first login
  if (user.status === "pending") {
    user.status = "active";
    await user.save();
  }

  // Issue JWT and set cookie
  const token = generateToken(user.id);
  setCookieToken(res, token);

  user.password = undefined;

  return ApiResponse.success(res, 200, "Logged in successfully.", {
    user,
    // mustChangePassword flag tells frontend to show change-password screen
    mustChangePassword: user.mustChangePassword,
    redirectTo: `/${user.role}`,
  });
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/logout
 * Clears the auth cookie. Works for all roles.
 */
export const logout = asyncHandler(async (req, res) => {
  clearCookieToken(res);
  return ApiResponse.success(res, 200, "Logged out successfully.");
});

// ─── GET CURRENT USER (Auth Check) ────────────────────────────────────────────
/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user (used by frontend on app load).
 * authenticate middleware populates req.user.
 */
export const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, 200, "Authenticated.", { user: req.user });
});

// ─── SEND EMAIL VERIFICATION ──────────────────────────────────────────────────
/**
 * POST /api/v1/auth/send-verification-email
 * Sends a verification link to the logged-in owner's email.
 */
export const sendVerificationEmail = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.verified) {
    return ApiResponse.error(res, 400, "Your email is already verified.");
  }

  const token = generateVerificationToken(user.id);
  await sendEmailVerification({ toEmail: user.email, toName: user.name, token });

  return ApiResponse.success(res, 200, "Verification email sent. Please check your inbox.");
});

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/verify-email
 * Body: { token } — The JWT token from the verification email link.
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return ApiResponse.error(res, 400, "Verification token is required.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFICATION);
  } catch {
    return ApiResponse.error(res, 400, "Invalid or expired verification link. Please request a new one.");
  }

  // Extra security: ensure the token was issued for the currently logged-in user
  if (decoded.id !== req.user.id) {
    return ApiResponse.error(res, 403, "This verification link is not for your account.");
  }

  const user = await User.findByPk(decoded.id);
  if (!user) return ApiResponse.error(res, 404, "User not found.");

  user.verified = true;
  await user.save();

  user.password = undefined;
  return ApiResponse.success(res, 200, "Email verified successfully.", { user });
});

// ─── CHANGE PASSWORD (First Login Forced Change) ──────────────────────────────
/**
 * POST /api/v1/auth/change-password
 * Used by staff to change their temp password on first login.
 * Body: { currentPassword, newPassword }
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    return ApiResponse.error(res, 401, "Current password is incorrect.");
  }

  user.password = newPassword; // beforeUpdate hook will hash it
  user.mustChangePassword = false;
  await user.save();

  return ApiResponse.success(res, 200, "Password changed successfully.");
});
