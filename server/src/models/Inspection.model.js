import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Inspection = sequelize.define(
  "Inspection",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    buildingId: { type: DataTypes.UUID, allowNull: false },
    tenancyId: { type: DataTypes.UUID, allowNull: false },
    inspectedById: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.ENUM("move_in", "move_out"), allowNull: false },
    inspectionDate: { type: DataTypes.DATEONLY, allowNull: false },
    items: { type: DataTypes.JSONB, defaultValue: [] },
    generalNotes: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM("draft", "completed"),
      defaultValue: "draft",
    },
    tenantAcknowledged: { type: DataTypes.BOOLEAN, defaultValue: false },
    tenantAcknowledgedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "inspections",
    timestamps: true,
  },
);

export default Inspection;
