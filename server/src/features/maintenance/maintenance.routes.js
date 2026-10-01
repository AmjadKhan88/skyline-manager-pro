import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { maintenancePhotoUpload } from "../../shared/middlewares/multer.js";
import {
  createRequestSchema,
  assignRequestSchema,
  updateStatusSchema,
} from "./maintenance.validator.js";
import {
  createRequest,
  getAllRequests,
  getRequestById,
  assignRequest,
  updateStatus,
  deleteRequest,
} from "./maintenance.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope);

router.get("/", getAllRequests);
router.get("/:id", getRequestById);
router.post(
  "/",
  authorize("tenant", "employee"),
  maintenancePhotoUpload,
  validateBody(createRequestSchema),
  createRequest,
);
router.patch(
  "/:id/assign",
  authorize("owner", "manager"),
  validateBody(assignRequestSchema),
  assignRequest,
);
router.patch(
  "/:id/status",
  authorize("owner", "manager", "employee"),
  validateBody(updateStatusSchema),
  updateStatus,
);
router.delete("/:id", authorize("owner", "manager"), deleteRequest);

export default router;
