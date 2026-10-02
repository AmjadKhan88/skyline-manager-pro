import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const PaymentSubmission = sequelize.define(
  "PaymentSubmission",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    tenancyId: { type: DataTypes.UUID, allowNull: false },
    tenantId: { type: DataTypes.UUID, allowNull: false },
    paymentAccountId: { type: DataTypes.UUID, allowNull: true },
    method: {
      type: DataTypes.ENUM("bank_transfer", "jazzcash", "easypaisa", "other"),
      allowNull: false,
    },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    periodMonth: { type: DataTypes.DATEONLY, allowNull: true },
    transactionReference: { type: DataTypes.STRING(100), allowNull: true },
    proofImageUrl: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    reviewedById: { type: DataTypes.UUID, allowNull: true },
    reviewNotes: { type: DataTypes.TEXT, allowNull: true },
    reviewedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "payment_submissions",
    timestamps: true,
  },
);

export default PaymentSubmission;
