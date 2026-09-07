/**
 * routes/v1/auth.routes.js — Authentication Routes
 *
 * All auth routes are under /api/v1/auth
 * Public routes: signup, login, google OAuth
 * Protected routes: logout, me, verify-email, change-password
 */

import express from "express";
import passport from "passport";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import {
  signup,
  login,
  logout,
  getMe,
  sendVerificationEmail,
  verifyEmail,
  changePassword,
} from "../controllers/auth.controller.js";
import { generateToken, setCookieToken } from "../services/auth.service.js";

const router = express.Router();

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post("/signup", validateBody(registerSchema), signup);
router.post("/login", validateBody(loginSchema), login);

// ── Google OAuth (Owner only) ─────────────────────────────────────────────────
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google` }),
  (req, res) => {
    const token = generateToken(req.user.id);
    setCookieToken(res, token);
    res.redirect(`${process.env.FRONTEND_URL}/owner`);
  }
);

// ── Protected Routes (any authenticated user) ─────────────────────────────────
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);
router.post("/send-verification-email", authenticate, authorize("owner"), sendVerificationEmail);
router.post("/verify-email", authenticate, authorize("owner"), verifyEmail);
router.post("/change-password", authenticate, changePassword);

export default router;
