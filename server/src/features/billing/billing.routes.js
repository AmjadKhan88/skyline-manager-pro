import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import {
  updateTenancyBillingSchema,
  waiveChargeSchema,
} from "./billing.validator.js";
import {
  getRentRoll,
  updateTenancyBilling,
  waiveCharge,
  runBillingCycle,
} from "./billing.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope);

router.get("/rent-roll", getRentRoll);
router.put(
  "/tenancy/:tenancyId",
  authorize("owner"),
  validateBody(updateTenancyBillingSchema),
  updateTenancyBilling,
);
router.patch(
  "/charges/:id/waive",
  authorize("owner", "manager"),
  validateBody(waiveChargeSchema),
  waiveCharge,
);
router.post("/run-cycle", authorize("owner"), runBillingCycle);

export default router;
