import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { createVendorSchema, updateVendorSchema } from "./vendor.validator.js";
import {
  createVendor,
  getAllVendors,
  updateVendor,
  deleteVendor,
} from "./vendor.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope, authorize("owner", "manager"));

router.get("/", getAllVendors);
router.post(
  "/",
  authorize("owner"),
  validateBody(createVendorSchema),
  createVendor,
);
router.put(
  "/:id",
  authorize("owner"),
  validateBody(updateVendorSchema),
  updateVendor,
);
router.delete("/:id", authorize("owner"), deleteVendor);

export default router;
