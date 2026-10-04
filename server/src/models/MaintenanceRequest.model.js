import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const MaintenanceRequest = sequelize.define(
  "MaintenanceRequest",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    buildingId: { type: DataTypes.UUID, allowNull: false },
    reportedById: { type: DataTypes.UUID, allowNull: false },
    assignedToId: { type: DataTypes.UUID, allowNull: true },
    assignedVendorId: { type: DataTypes.UUID, allowNull: true },
    unitNumber: { type: DataTypes.STRING(50), allowNull: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    category: {
      type: DataTypes.ENUM(
        "plumbing",
        "electrical",
        "hvac",
        "appliance",
        "structural",
        "pest-control",
        "other",
      ),
      defaultValue: "other",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("open", "in-progress", "resolved", "cancelled"),
      defaultValue: "open",
    },
    photoUrl: { type: DataTypes.STRING, allowNull: true },
    resolutionNotes: { type: DataTypes.TEXT, allowNull: true },
    resolvedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "maintenance_requests",
    timestamps: true,
    paranoid: true,
  },
);

export default MaintenanceRequest;
