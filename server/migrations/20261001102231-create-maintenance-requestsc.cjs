"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable("maintenance_requests", {
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
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "buildings", key: "id" },
        onDelete: "CASCADE",
      },
      reportedById: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      assignedToId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      unitNumber: { type: DataTypes.STRING(50), allowNull: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      category: {
        type: DataTypes.ENUM(
          "plumbing",
          "electrical",
          "hvac",
          "appliance",
          "structural",
          "pest-control",
          "other",
        ),
        defaultValue: "other",
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "urgent"),
        defaultValue: "medium",
      },
      status: {
        type: DataTypes.ENUM("open", "in-progress", "resolved", "cancelled"),
        defaultValue: "open",
      },
      photoUrl: { type: DataTypes.STRING, allowNull: true },
      resolutionNotes: { type: DataTypes.TEXT, allowNull: true },
      resolvedAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE }, // paranoid: true
    });

    await queryInterface.addIndex("maintenance_requests", ["ownerId"]);
    await queryInterface.addIndex("maintenance_requests", ["buildingId"]);
    await queryInterface.addIndex("maintenance_requests", ["reportedById"]);
    await queryInterface.addIndex("maintenance_requests", ["assignedToId"]);
    await queryInterface.addIndex("maintenance_requests", ["status"]);
    await queryInterface.addIndex("maintenance_requests", ["priority"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("maintenance_requests");
  },
};
