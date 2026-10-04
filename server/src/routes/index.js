/**
 * routes/index.js — API v1 Router
 *
 * Central mount point for all versioned API routes.
 * Imported once in server.js as: app.use('/api/v1', v1Router)
 */

import express from "express";
import authRoutes from "../features/auth/auth.routes.js";
import ownerRoutes from "../features/owner/owner.routes.js";
import buildingRoutes from "../features/buildings/building.routes.js";
import staffRoutes from "../features/staff/staff.routes.js";
import tenantRoutes from "../features/tenants/tenant.routes.js";
import maintenanceRoutes from "../features/maintenance/maintenance.routes.js";
import announcementRoutes from "../features/announcements/announcement.routes.js";
import documentRoutes from "../features/documents/document.routes.js";
import paymentRoutes from "../features/payments/payment.routes.js";
import expenseRoutes from "../features/expenses/expense.routes.js";
import vendorRoutes from "../features/vendors/vendor.routes.js";

const v1Router = express.Router();

v1Router.use("/auth", authRoutes);
v1Router.use("/owner", ownerRoutes);
v1Router.use("/buildings", buildingRoutes);
v1Router.use("/staff", staffRoutes);
v1Router.use("/tenants", tenantRoutes);
v1Router.use("/maintenance", maintenanceRoutes);
v1Router.use("/announcements", announcementRoutes);
v1Router.use("/documents", documentRoutes);
v1Router.use("/payments", paymentRoutes);
v1Router.use("/expenses", expenseRoutes);
v1Router.use("/vendors", vendorRoutes);

export default v1Router;
