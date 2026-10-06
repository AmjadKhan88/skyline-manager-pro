import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const RentCharge = sequelize.define(
  "RentCharge",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    buildingId: { type: DataTypes.UUID, allowNull: false },
    tenancyId: { type: DataTypes.UUID, allowNull: false },
    periodMonth: { type: DataTypes.DATEONLY, allowNull: false },
    dueDate: { type: DataTypes.DATEONLY, allowNull: false },
    baseAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    appliedLateFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    amountPaid: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("pending", "partial", "paid", "overdue", "waived"),
      defaultValue: "pending",
    },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "rent_charges",
    timestamps: true,
  },
);

export default RentCharge;
