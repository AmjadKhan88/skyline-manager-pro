import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Vendor = sequelize.define(
  "Vendor",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    companyName: { type: DataTypes.STRING(150), allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    email: { type: DataTypes.STRING(150), allowNull: true },
    specialty: {
      type: DataTypes.ENUM(
        "plumbing",
        "electrical",
        "hvac",
        "appliance",
        "structural",
        "pest-control",
        "general",
      ),
      defaultValue: "general",
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "vendors",
    timestamps: true,
  },
);

export default Vendor;
