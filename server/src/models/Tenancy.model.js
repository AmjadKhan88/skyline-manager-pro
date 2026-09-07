/**
 * Tenancy.model.js — Tenant Lease Data
 *
 * Stores the lease/rental agreement between a tenant user and a building.
 * This is completely separate from the User model to allow one tenant user
 * to potentially have multiple historical tenancy records over time.
 *
 * KEY DESIGN DECISIONS:
 * - `ownerId` is denormalized here (even though it can be derived via buildingId → ownerId)
 *   for performance — direct WHERE ownerId = X scoping without a JOIN on buildings.
 * - `paymentStatus` tracks the CURRENT month's rent payment. Historical payments
 *   would live in a separate Payment/Transaction table (future phase).
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Tenancy = sequelize.define(
  "Tenancy",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // The tenant user (role = 'tenant' in users table)
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    // Which building/tower is the tenant in?
    buildingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "buildings",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    /**
     * ownerId — ISOLATION KEY (denormalized for query performance)
     * Duplicated from buildings.ownerId to allow direct scoping:
     *   WHERE tenancies.ownerId = req.scopedOwnerId
     * without needing to JOIN buildings on every tenant query.
     */
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    // Unit or flat number within the building (e.g. "3B", "Floor 5 - Office 2")
    unitNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Unit number is required" },
      },
    },

    monthlyRent: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: { args: 0, msg: "Rent cannot be negative" },
      },
    },

    depositAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      validate: {
        min: { args: 0, msg: "Deposit cannot be negative" },
      },
    },

    leaseStart: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    leaseEnd: {
      type: DataTypes.DATEONLY,
      allowNull: true, // NULL = open-ended lease
    },

    /**
     * paymentStatus — current rent payment state.
     * Managed by owner/manager when they record a payment.
     */
    paymentStatus: {
      type: DataTypes.ENUM("paid", "unpaid", "overdue", "partial"),
      defaultValue: "unpaid",
    },

    /**
     * status — lifecycle state of the tenancy itself (not the payment).
     * active    → tenant is currently living/using the unit
     * terminated → lease has ended
     * pending   → application approved, not yet moved in
     */
    status: {
      type: DataTypes.ENUM("active", "terminated", "pending"),
      defaultValue: "pending",
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "tenancies",
    timestamps: true,
    paranoid: true, // Soft-delete for lease history preservation

    indexes: [
      { fields: ["ownerId"] },    // Scoped tenant list queries
      { fields: ["buildingId"] }, // All tenants in a building
      { fields: ["tenantId"] },   // A tenant's own lease lookup
      { fields: ["paymentStatus"] },
    ],
  }
);

export default Tenancy;
