import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Announcement = sequelize.define(
  "Announcement",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: { type: DataTypes.UUID, allowNull: false },
    buildingId: { type: DataTypes.UUID, allowNull: true }, // null = all buildings
    authorId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    priority: {
      type: DataTypes.ENUM("info", "warning", "urgent"),
      defaultValue: "info",
    },
  },
  {
    tableName: "announcements",
    timestamps: true,
  },
);

export default Announcement;
