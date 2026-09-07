import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import {
  getAllBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from "./building.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope);

router.get("/", authorize("owner", "manager"), getAllBuildings);
router.get("/:id", authorize("owner", "manager"), getBuildingById);
router.post("/", authorize("owner"), createBuilding);
router.put("/:id", authorize("owner"), updateBuilding);
router.delete("/:id", authorize("owner"), deleteBuilding);

export default router;