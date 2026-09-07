/**
 * Building.model.js
 *
 * Represents a physical building or tower managed on the platform.
 *
 * ISOLATION:
 * Every building belongs to exactly one owner via `ownerId` (FK → users.id).
 * All queries on this table MUST include `WHERE ownerId = req.scopedOwnerId`
 * to prevent cross-owner data leakage (enforced via tenantScope middleware).
 *
 * A manager can be assigned to a building via `managerId`.
 * A building uses `paranoid: true` for soft-deletion (deletedAt timestamp),
 * so historical data is preserved even after a building is "removed".
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.js";

const Building = sequelize.define(
  "Building",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Building name cannot be empty" },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING(300),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Address cannot be empty" },
      },
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    buildingType: {
      type: DataTypes.ENUM(
        "residential",
        "commercial",
        "industrial",
        "mixed-use",
        "educational",
        "healthcare"
      ),
      defaultValue: "residential",
    },

    floors: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1 },
    },

    units: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1 },
    },

    status: {
      type: DataTypes.ENUM(
        "planning",
        "under-construction",
        "completed",
        "occupied",
        "renovating",
        "operational"
      ),
      defaultValue: "operational",
    },

    occupancy: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
      // Percentage of units currently occupied
    },

    energyRating: {
      type: DataTypes.ENUM("A", "B", "C", "D", "E", "F", "G"),
      allowNull: true,
    },

    greenCertification: {
      type: DataTypes.ENUM("LEED", "BREEAM", "WELL", "ENERGY_STAR", "none"),
      defaultValue: "none",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    /**
     * ownerId — ISOLATION KEY
     * FK to users.id (where role = 'owner').
     * Every building is owned by exactly one SaaS tenant (owner).
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

    /**
     * managerId — Optional assigned manager for this building.
     * FK to users.id (where role = 'manager').
     * A building can have zero or one manager at a time.
     */
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },

    // Flexible JSONB for custom fields the owner defines
    extraFields: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  },
  {
    tableName: "buildings",
    timestamps: true,
    paranoid: true, // Soft-delete: sets deletedAt rather than destroying the row

    indexes: [
      { fields: ["ownerId"] },    // Most frequent query pattern
      { fields: ["managerId"] },
      { fields: ["buildingType"] },
      { fields: ["status"] },
    ],
  }
);

export default Building;