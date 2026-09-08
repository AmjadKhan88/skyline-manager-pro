/**
 * features/staff/staff.routes.js — Manager & Employee Routes
 * All under /api/v1/staff — owner only (read + write)
 */

import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { imagesUpload } from "../../shared/middlewares/multer.js";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  deleteStaff,
  resendCredentials,
} from "./staff.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope);

router.get("/", authorize("owner", "manager"), getAllStaff);
router.get("/:id", authorize("owner", "manager"), getStaffById);
router.post("/", authorize("owner"), imagesUpload, createStaff);
router.put("/:id", authorize("owner"), imagesUpload, updateStaff);
router.patch("/:id/status", authorize("owner"), toggleStaffStatus);
router.delete("/:id", authorize("owner"), deleteStaff);
router.post("/:id/resend-credentials", authorize("owner"), resendCredentials);

export default router;