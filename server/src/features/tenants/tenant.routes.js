/**
 * features/tenants/tenant.routes.js — Tenant & Lease Routes
 * All under /api/v1/tenants
 *
 * AUTHORIZATION:
 *   owner + manager → read tenants (scoped)
 *   owner only      → create, update, delete
 *   tenant (self)   → GET /my-lease (their own lease info only)
 */

import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  updatePaymentStatus,
  deleteTenant,
  getMyLease,
} from "./tenant.controller.js";

const router = express.Router();

router.get("/my-lease", authenticate, tenantScope, authorize("tenant"), getMyLease);

router.get("/", authenticate, tenantScope, authorize("owner", "manager"), getAllTenants);
router.get("/:id", authenticate, tenantScope, authorize("owner", "manager"), getTenantById);

router.post("/", authenticate, tenantScope, authorize("owner"), createTenant);
router.put("/:id", authenticate, tenantScope, authorize("owner"), updateTenant);
router.patch("/:id/payment", authenticate, tenantScope, authorize("owner", "manager"), updatePaymentStatus);
router.delete("/:id", authenticate, tenantScope, authorize("owner"), deleteTenant);

export default router;