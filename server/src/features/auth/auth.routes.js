import express from "express";
import passport from "passport";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "./auth.validator.js";
import {
  signup,
  login,
  logout,
  getMe,
  sendVerificationEmail,
  verifyEmail,
  changePassword,
} from "./auth.controller.js";
import { generateToken, setCookieToken } from "../../shared/services/token.service.js";

const router = express.Router();

router.post("/signup", validateBody(registerSchema), signup);
router.post("/login", validateBody(loginSchema), login);

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

router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);
router.post("/send-verification-email", authenticate, authorize("owner"), sendVerificationEmail);
router.post("/verify-email", authenticate, authorize("owner"), verifyEmail);
router.post("/change-password", authenticate, changePassword);

export default router;