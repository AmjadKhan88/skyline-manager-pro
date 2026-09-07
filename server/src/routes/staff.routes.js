/**
 * routes/v1/staff.routes.js — Manager & Employee Routes
 * All under /api/v1/staff — owner only (read + write)
 *
 * Managers can view staff in their building via a separate filtered endpoint.
 */

import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { tenantScope } from "../middlewares/tenantScope.js";
import { imagesUpload } from "../middlewares/multer.js";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  deleteStaff,
  resendCredentials,
} from "../controllers/staff.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope, authorize("owner"));

router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.post("/", imagesUpload, createStaff);
router.put("/:id", imagesUpload, updateStaff);
router.patch("/:id/status", toggleStaffStatus);
router.delete("/:id", deleteStaff);
router.post("/:id/resend-credentials", resendCredentials);

export default router;
