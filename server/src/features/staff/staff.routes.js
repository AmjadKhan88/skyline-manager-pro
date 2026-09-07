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

router.use(authenticate, tenantScope, authorize("owner"));

router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.post("/", imagesUpload, createStaff);
router.put("/:id", imagesUpload, updateStaff);
router.patch("/:id/status", toggleStaffStatus);
router.delete("/:id", deleteStaff);
router.post("/:id/resend-credentials", resendCredentials);

export default router;