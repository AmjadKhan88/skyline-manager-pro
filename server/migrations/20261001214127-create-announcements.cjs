"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable("announcements", {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      buildingId: {
        // NULL = portfolio-wide, visible across all of this owner's buildings
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "buildings", key: "id" },
        onDelete: "CASCADE",
      },
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      title: { type: DataTypes.STRING(200), allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      priority: {
        type: DataTypes.ENUM("info", "warning", "urgent"),
        defaultValue: "info",
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex("announcements", ["ownerId"]);
    await queryInterface.addIndex("announcements", ["buildingId"]);
    await queryInterface.addIndex("announcements", ["authorId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("announcements");
  },
};
