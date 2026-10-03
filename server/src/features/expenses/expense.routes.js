import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import { receiptUpload } from "../../shared/middlewares/multer.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "./expense.validator.js";
import {
  createExpense,
  getAllExpenses,
  updateExpense,
  deleteExpense,
} from "./expense.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope, authorize("owner", "manager"));

router.get("/", getAllExpenses);
router.post(
  "/",
  receiptUpload,
  validateBody(createExpenseSchema),
  createExpense,
);
router.put(
  "/:id",
  receiptUpload,
  validateBody(updateExpenseSchema),
  updateExpense,
);
router.delete("/:id", deleteExpense);

export default router;
