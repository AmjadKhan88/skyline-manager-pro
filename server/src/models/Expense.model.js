import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Expense = sequelize.define(
  "Expense",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    buildingId: { type: DataTypes.UUID, allowNull: false },
    recordedById: { type: DataTypes.UUID, allowNull: false },
    category: {
      type: DataTypes.ENUM(
        "maintenance",
        "utilities",
        "salary",
        "insurance",
        "tax",
        "repairs",
        "supplies",
        "other",
      ),
      defaultValue: "other",
    },
    description: { type: DataTypes.STRING(300), allowNull: false },
    vendor: { type: DataTypes.STRING(150), allowNull: true },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    expenseDate: { type: DataTypes.DATEONLY, allowNull: false },
    receiptUrl: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "expenses",
    timestamps: true,
  },
);

export default Expense;
