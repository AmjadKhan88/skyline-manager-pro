/**
 * features/auth/auth.controller.js — Authentication Controller
 *
 * Handles signup (owners only), universal login (all roles),
 * logout, email verification, and profile check.
 *
 * IMPORTANT: Only owners self-register. All other roles (manager, employee, tenant)
 * are created BY the owner via the staff/tenant features.
 */

import { User, OwnerProfile } from "../../models/index.js";
import {
  generateToken,
  setCookieToken,
  clearCookieToken,
  generateVerificationToken,
} from "../../shared/services/token.service.js";
import { sendEmailVerification } from "../../shared/services/email.service.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// ─── SIGNUP (Owner Registration) ──────────────────────────────────────────────
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return ApiResponse.error(res, 400, "An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "owner",
    status: "active",
    verified: false,
    ownerId: null,
  });

  await OwnerProfile.create({
    userId: user.id,
    subscriptionPlan: "basic",
    maxBuildings: 3,
  });

  const token = generateToken(user.id);
  setCookieToken(res, token);

  user.password = undefined;
  return ApiResponse.success(res, 201, "Account created successfully. Please verify your email.", { user });
});

// ─── LOGIN (Universal — All Roles) ────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return ApiResponse.error(res, 401, "No account found with this email address.");
  }

  if (user.status === "inactive") {
    return ApiResponse.error(res, 403, "Your account has been deactivated. Please contact your building owner.");
  }

  if (user.googleId && !user.password) {
    return ApiResponse.error(res, 400, "This account uses Google Sign-In. Please log in with Google.");
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return ApiResponse.error(res, 401, "Incorrect password. Please try again.");
  }

  if (user.status === "pending") {
    user.status = "active";
    await user.save();
  }

  const token = generateToken(user.id);
  setCookieToken(res, token);

  user.password = undefined;

  return ApiResponse.success(res, 200, "Logged in successfully.", {
    user,
    mustChangePassword: user.mustChangePassword,
    redirectTo: `/${user.role}`,
  });
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  clearCookieToken(res);
  return ApiResponse.success(res, 200, "Logged out successfully.");
});

// ─── GET CURRENT USER (Auth Check) ────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, 200, "Authenticated.", { user: req.user });
});

// ─── SEND EMAIL VERIFICATION ──────────────────────────────────────────────────
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
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    return ApiResponse.error(res, 401, "Current password is incorrect.");
  }

  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();

  return ApiResponse.success(res, 200, "Password changed successfully.");
});