import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Document = sequelize.define(
  "Document",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    buildingId: { type: DataTypes.UUID, allowNull: true },
    tenancyId: { type: DataTypes.UUID, allowNull: true },
    subjectUserId: { type: DataTypes.UUID, allowNull: true },
    uploadedById: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    category: {
      type: DataTypes.ENUM(
        "lease",
        "id_proof",
        "insurance",
        "inspection",
        "permit",
        "financial",
        "other",
      ),
      defaultValue: "other",
    },
    fileUrl: { type: DataTypes.STRING, allowNull: false },
    fileType: { type: DataTypes.STRING(20), allowNull: true },
  },
  {
    tableName: "documents",
    timestamps: true,
  },
);

export default Document;
