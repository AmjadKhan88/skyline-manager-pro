import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const PaymentAccount = sequelize.define(
  "PaymentAccount",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    method: {
      type: DataTypes.ENUM("bank_transfer", "jazzcash", "easypaisa", "other"),
      allowNull: false,
    },
    label: { type: DataTypes.STRING(100), allowNull: false },
    accountTitle: { type: DataTypes.STRING(150), allowNull: false },
    accountNumber: { type: DataTypes.STRING(50), allowNull: false },
    bankName: { type: DataTypes.STRING(100), allowNull: true },
    iban: { type: DataTypes.STRING(50), allowNull: true },
    qrCodeUrl: { type: DataTypes.STRING, allowNull: true },
    instructions: { type: DataTypes.TEXT, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "payment_accounts",
    timestamps: true,
  },
);

export default PaymentAccount;
