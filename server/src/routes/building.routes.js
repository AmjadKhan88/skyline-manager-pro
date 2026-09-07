/**
 * routes/v1/building.routes.js — Building CRUD Routes
 * All under /api/v1/buildings
 *
 * GET  (read)  → owner + manager (both scoped to same owner's buildings)
 * POST/PUT/DELETE (write) → owner only
 */

import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { tenantScope } from "../middlewares/tenantScope.js";
import {
  getAllBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from "../controllers/building.controller.js";

const router = express.Router();

// All building routes require authentication and tenant scoping
router.use(authenticate, tenantScope);

router.get("/", authorize("owner", "manager"), getAllBuildings);
router.get("/:id", authorize("owner", "manager"), getBuildingById);
router.post("/", authorize("owner"), createBuilding);
router.put("/:id", authorize("owner"), updateBuilding);
router.delete("/:id", authorize("owner"), deleteBuilding);

export default router;
