import express from "express";
import authRoutes from "../features/auth/auth.routes.js";
import ownerRoutes from "../features/owner/owner.routes.js";
import buildingRoutes from "../features/buildings/building.routes.js";
import staffRoutes from "../features/staff/staff.routes.js";
import tenantRoutes from "../features/tenants/tenant.routes.js";

const v1Router = express.Router();

v1Router.use("/auth", authRoutes);
v1Router.use("/owner", ownerRoutes);
v1Router.use("/buildings", buildingRoutes);
v1Router.use("/staff", staffRoutes);
v1Router.use("/tenants", tenantRoutes);

export default v1Router;