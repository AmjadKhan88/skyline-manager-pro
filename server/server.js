/**
 * server.js — SkyLine Manager Pro API Server
 *
 * ARCHITECTURE OVERVIEW:
 * ┌─────────────────────────────────────────────────────┐
 * │  Express App                                         │
 * │                                                      │
 * │  Security Middleware (helmet, cors, rate-limit)      │
 * │       ↓                                              │
 * │  Request Middleware (body-parser, cookie, morgan)    │
 * │       ↓                                              │
 * │  API v1 Routes → /api/v1/*                           │
 * │    ├── /auth    → signup, login, logout, verify      │
 * │    ├── /owner   → dashboard, profile (owner only)    │
 * │    ├── /buildings → CRUD (scoped by ownerId)         │
 * │    ├── /staff   → managers/employees (owner only)    │
 * │    └── /tenants → tenant management (owner+manager)  │
 * │       ↓                                              │
 * │  404 Handler → Unknown routes                        │
 * │  Global Error Handler → asyncHandler errors          │
 * └─────────────────────────────────────────────────────┘
 *
 * MULTI-SaaS ISOLATION:
 * Data isolation is enforced via the `tenantScope` middleware on every
 * protected route. All DB queries use req.scopedOwnerId to filter results.
 */

import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";

// Configs
import "./src/configs/passport.js";
import { sequelize, connectDB } from "./src/configs/db.js";

// Models — import index to register all models + associations before sync
import "./src/models/index.js";

// Middleware
import errorHandler from "./src/middlewares/errorHandler.js";
import { apiLimiter, authLimiter } from "./src/middlewares/rateLimiter.js";

// Versioned API Router (mounted at /api/v1 below — folder itself is flat, version lives in the mount path)
import v1Router from "./src/routes/index.js";

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true, // Required for httpOnly cookie auth
  })
);

// ─── Request Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// ─── Passport (Google OAuth) ──────────────────────────────────────────────────
app.use(passport.initialize());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Strict limiter on auth endpoints to prevent brute-force
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/signup", authLimiter);

// General limiter on all other API routes
app.use("/api/v1", apiLimiter);

// ─── Database Connection + Sync ───────────────────────────────────────────────
await connectDB();

/**
 * sequelize.sync({ alter: true }) — Safely update table schemas to match models
 * without dropping existing data. Use { force: true } ONLY in development
 * when you want to reset all tables (drops and recreates).
 *
 * NOTE: For production, replace sync with proper Sequelize migrations.
 */
// await sequelize.sync({ alter: true });
// console.log("✅ Database synced");

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API v1 Routes ─────────────────────────────────────────────────────────────
/**
 * All API routes are versioned under /api/v1
 * This makes future API versions (/api/v2) non-breaking for existing clients.
 */
app.use("/api/v1", v1Router);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 SkyLine Manager Pro API running on port ${PORT} [${NODE_ENV}]`);
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1`);
});

export default app;