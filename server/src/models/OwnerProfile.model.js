/**
 * OwnerProfile.model.js
 *
 * Stores owner-specific business information in a 1:1 relationship with the User model.
 * Separated from the base User model to keep the users table lean while
 * still allowing rich owner metadata (business name, subscription plan, limits).
 *
 * Created automatically when a new owner registers.
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.js";

const OwnerProfile = sequelize.define(
  "OwnerProfile",
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
      unique: true, // Enforces strict 1:1 relationship
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    businessName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    businessAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    taxId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    avatar: {
      type: DataTypes.STRING, // Cloudinary URL
      allowNull: true,
    },

    /**
     * subscriptionPlan — controls feature limits for this SaaS tenant.
     * basic      → up to 3 buildings
     * pro        → up to 20 buildings
     * enterprise → unlimited buildings
     */
    subscriptionPlan: {
      type: DataTypes.ENUM("basic", "pro", "enterprise"),
      defaultValue: "basic",
    },

    // Maximum buildings allowed under current plan
    maxBuildings: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
  },
  {
    tableName: "owner_profiles",
    timestamps: true,
  }
);

export default OwnerProfile;
