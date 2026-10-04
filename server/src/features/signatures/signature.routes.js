import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { signatureUpload } from "../../shared/middlewares/multer.js";
import { createSignatureSchema } from "./signature.validator.js";
import {
  createSignature,
  getSignaturesForTenancy,
} from "./signature.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope);

router.get("/tenancy/:tenancyId", getSignaturesForTenancy);
router.post(
  "/",
  authorize("owner", "manager", "tenant"),
  signatureUpload,
  validateBody(createSignatureSchema),
  createSignature,
);

export default router;
