/**
 * User.model.js — Unified User Model
 *
 * ARCHITECTURE NOTE:
 * This single model replaces the previous split between Auth (owners) and User (staff).
 * All roles — owner, manager, employee, tenant — now live in ONE table.
 *
 * MULTI-SaaS ISOLATION:
 * The `ownerId` column is the cornerstone of data isolation.
 * - Owners have ownerId = NULL (they are the root of their own tenant space)
 * - Managers, employees, and tenants have ownerId = their_owner's_UUID
 * - The `tenantScope` middleware injects req.scopedOwnerId so every
 *   controller query automatically filters by the correct owner.
 *
 * PASSWORD SECURITY:
 * Passwords are hashed via bcrypt in Sequelize lifecycle hooks (beforeCreate / beforeUpdate),
 * so plain-text passwords are NEVER written to the database, even accidentally.
 */

import bcrypt from "bcryptjs";
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Name cannot be empty" },
        len: { args: [2, 100], msg: "Name must be 2–100 characters" },
      },
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Must be a valid email address" },
      },
      set(value) {
        // Always store email in lowercase and trimmed
        this.setDataValue("email", value.toLowerCase().trim());
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true, // Nullable for Google OAuth users who have no password
      validate: {
        len: { args: [0, 255], msg: "Password too long" },
      },
    },

    /**
     * role — determines what this user can access.
     *
     * owner      → SaaS tenant root. Can manage buildings, staff, tenants.
     * manager    → Assigned to one or more buildings. Can manage employees/tenants in their building.
     * employee   → Building staff (security, maintenance, etc.). Limited dashboard access.
     * tenant     → Building resident. Can view their own lease and building info.
     */
    role: {
      type: DataTypes.ENUM("owner", "manager", "employee", "tenant"),
      allowNull: false,
      defaultValue: "owner",
    },

    status: {
      type: DataTypes.ENUM("active", "inactive", "pending"),
      defaultValue: "pending",
      // 'pending' = credentials sent but user hasn't logged in yet
      // 'active'  = normal active user
      // 'inactive' = disabled by owner
    },

    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      // Email verification flag — required before owner can use the platform
    },

    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      // Used for Google OAuth login (owners only)
    },

    /**
     * ownerId — THE MULTI-SaaS ISOLATION KEY
     *
     * Self-referencing FK: this user belongs to which owner?
     * - NULL for all owner-role users
     * - Points to the owner's UUID for all manager/employee/tenant users
     *
     * This single field lets us scope EVERY query to a specific SaaS tenant:
     *   WHERE ownerId = req.scopedOwnerId
     */
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true, // NULL for owners themselves
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE", // If owner is deleted, all their staff are deleted too
    },

    // Flag to force password change on first login (used when owner creates staff with temp password)
    mustChangePassword: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: true, // Soft-delete: sets deletedAt instead of actually deleting rows

    indexes: [
      { unique: true, fields: ["email"] },
      { fields: ["role"] },
      { fields: ["ownerId"] }, // Critical for scoped queries
      { fields: ["status"] },
    ],

    hooks: {
      /**
       * beforeCreate — Hash plain-text password before inserting new user.
       * Salt rounds = 12 (high security, ~250ms on modern hardware).
       */
      async beforeCreate(user) {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },

      /**
       * beforeUpdate — Re-hash only if the password field was actually changed.
       * This prevents double-hashing when updating other fields like name/status.
       */
      async beforeUpdate(user) {
        if (user.changed("password") && user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

/**
 * Instance method: comparePassword
 * Use this to verify a login attempt instead of calling bcrypt directly in controllers.
 *
 * @param {string} candidatePassword - Plain-text password from login request
 * @returns {Promise<boolean>}
 */
User.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default User;
