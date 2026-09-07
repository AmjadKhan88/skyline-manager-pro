import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { getDashboard, getProfile, updateProfile } from "./owner.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope, authorize("owner"));

router.get("/dashboard", getDashboard);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;