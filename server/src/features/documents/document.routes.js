import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { singleDocumentUpload } from "../../shared/middlewares/multer.js";
import { createDocumentSchema } from "./document.validator.js";
import {
  uploadDocument,
  getAllDocuments,
  deleteDocument,
} from "./document.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope);

router.get("/", getAllDocuments);
router.post(
  "/",
  authorize("owner", "manager", "tenant"),
  singleDocumentUpload,
  validateBody(createDocumentSchema),
  uploadDocument,
);
router.delete("/:id", authorize("owner", "manager", "tenant"), deleteDocument);

export default router;
