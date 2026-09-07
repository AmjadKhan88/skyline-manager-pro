/**
 * routes/v1/owner.routes.js — Owner Dashboard & Profile Routes
 * All under /api/v1/owner — requires authenticate + tenantScope + authorize('owner')
 */

import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { tenantScope } from "../middlewares/tenantScope.js";
import { getDashboard, getProfile, updateProfile } from "../controllers/owner.controller.js";

const router = express.Router();

// Apply middleware chain to all owner routes
router.use(authenticate, tenantScope, authorize("owner"));

router.get("/dashboard", getDashboard);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
