import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { qrCodeUpload, proofUpload } from "../../shared/middlewares/multer.js";
import {
  createAccountSchema,
  updateAccountSchema,
  createSubmissionSchema,
  reviewSubmissionSchema,
} from "./payment.validator.js";
import {
  createAccount,
  getAllAccounts,
  updateAccount,
  deleteAccount,
} from "./paymentAccount.controller.js";
import {
  createSubmission,
  getAllSubmissions,
  reviewSubmission,
} from "./paymentSubmission.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope);

// Payment accounts (owner manages, everyone scoped-in can read active ones)
router.get("/accounts", getAllAccounts);
router.post(
  "/accounts",
  authorize("owner"),
  qrCodeUpload,
  validateBody(createAccountSchema),
  createAccount,
);
router.put(
  "/accounts/:id",
  authorize("owner"),
  qrCodeUpload,
  validateBody(updateAccountSchema),
  updateAccount,
);
router.delete("/accounts/:id", authorize("owner"), deleteAccount);

// Payment submissions (tenant creates, owner/manager review)
router.get("/submissions", getAllSubmissions);
router.post(
  "/submissions",
  authorize("tenant"),
  proofUpload,
  validateBody(createSubmissionSchema),
  createSubmission,
);
router.patch(
  "/submissions/:id/review",
  authorize("owner", "manager"),
  validateBody(reviewSubmissionSchema),
  reviewSubmission,
);

export default router;
