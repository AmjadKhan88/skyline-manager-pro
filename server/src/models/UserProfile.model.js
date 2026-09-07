/**
 * UserProfile.model.js
 *
 * Stores role-specific details for non-owner users (manager, employee, tenant).
 * This replaces the previous separate Manager.model.js and Employee.model.js,
 * which duplicated the same columns (phone, salary, avatar, cnic, etc.).
 *
 * Why a single profile table instead of separate ones?
 * - Managers and employees share the same set of operational fields
 * - A `jobTitle` field replaces the old `employeeRole` ENUM (more flexible)
 * - Tenants use a subset of these fields; their lease data lives in Tenancy.model.js
 * - One table = one set of joins, one service, easier to maintain
 *
 * Created by the owner when they add a staff member or tenant via the dashboard.
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.js";

const UserProfile = sequelize.define(
  "UserProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // FK to the unified users table
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // 1:1 with user
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: { args: [7, 20], msg: "Phone must be 7–20 digits" },
      },
    },

    /**
     * avatar — Cloudinary URL for profile photo.
     * Stored as full URL; publicId is extracted when deletion is needed.
     */
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    /**
     * cnic — Cloudinary URL for uploaded CNIC/ID document image.
     * Owner uploads this during staff registration for verification purposes.
     */
    cnic: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    /**
     * salary — Monthly salary for managers and employees.
     * NULL for tenants (tenants have rent in Tenancy table instead).
     */
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: { args: 0, msg: "Salary cannot be negative" },
      },
    },

    /**
     * jobTitle — Human-readable job title.
     * Replaces the old `employeeRole` ENUM so owners can set any custom title.
     * Examples: "Security Guard", "Head Maintenance", "Building Manager"
     */
    jobTitle: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    /**
     * buildingId — Which building is this person assigned to?
     * Managers and employees are assigned to one building.
     * Tenants may have this set too (convenience), but their primary
     * building link is via Tenancy.buildingId.
     */
    buildingId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "buildings",
        key: "id",
      },
      onDelete: "SET NULL",
    },

    /**
     * extraFields — JSONB array for owner-defined custom fields.
     * Format: [{ key: "Emergency Contact", value: "03001234567" }, ...]
     * Gives owners flexibility to store any additional data.
     */
    extraFields: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  },
  {
    tableName: "user_profiles",
    timestamps: true,

    indexes: [
      { fields: ["buildingId"] }, // Fast lookup: all staff in a building
    ],
  }
);

export default UserProfile;
