import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import {
  createInspectionSchema,
  updateInspectionSchema,
} from "./inspection.validator.js";
import {
  createInspection,
  getAllInspections,
  updateInspection,
  acknowledgeInspection,
  deleteInspection,
} from "./inspection.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope);

router.get("/", getAllInspections);
router.post(
  "/",
  authorize("owner", "manager"),
  validateBody(createInspectionSchema),
  createInspection,
);
router.put(
  "/:id",
  authorize("owner", "manager"),
  validateBody(updateInspectionSchema),
  updateInspection,
);
router.patch("/:id/acknowledge", authorize("tenant"), acknowledgeInspection);
router.delete("/:id", authorize("owner", "manager"), deleteInspection);

export default router;
