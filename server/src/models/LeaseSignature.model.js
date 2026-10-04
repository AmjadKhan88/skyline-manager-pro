import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const LeaseSignature = sequelize.define(
  "LeaseSignature",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    tenancyId: { type: DataTypes.UUID, allowNull: false },
    signerId: { type: DataTypes.UUID, allowNull: false },
    signerRole: {
      type: DataTypes.ENUM("tenant", "owner", "manager"),
      allowNull: false,
    },
    signatureImageUrl: { type: DataTypes.STRING, allowNull: false },
    typedName: { type: DataTypes.STRING(150), allowNull: false },
    ipAddress: { type: DataTypes.STRING(64), allowNull: true },
    agreedAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    tableName: "lease_signatures",
    timestamps: true,
  },
);

export default LeaseSignature;
