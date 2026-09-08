import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { getManagerDashboard, getMyBuilding } from "./manager.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope, authorize("manager"));

router.get("/dashboard", getManagerDashboard);
router.get("/building", getMyBuilding);

export default router;