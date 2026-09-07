/**
 * routes/v1/index.js — API v1 Router
 *
 * Central mount point for all versioned API routes.
 * Imported once in server.js as: app.use('/api/v1', v1Router)
 *
 * Route tree:
 *   /api/v1/auth/*       → auth.routes.js
 *   /api/v1/owner/*      → owner.routes.js
 *   /api/v1/buildings/*  → building.routes.js
 *   /api/v1/staff/*      → staff.routes.js
 *   /api/v1/tenants/*    → tenant.routes.js
 */

import express from "express";
import authRoutes from "./auth.routes.js";
import ownerRoutes from "./owner.routes.js";
import buildingRoutes from "./building.routes.js";
import staffRoutes from "./staff.routes.js";
import tenantRoutes from "./tenant.routes.js";

const v1Router = express.Router();

v1Router.use("/auth", authRoutes);
v1Router.use("/owner", ownerRoutes);
v1Router.use("/buildings", buildingRoutes);
v1Router.use("/staff", staffRoutes);
v1Router.use("/tenants", tenantRoutes);

export default v1Router;
