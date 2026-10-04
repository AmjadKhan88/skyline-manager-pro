"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable("inspections", {
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
      tenancyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "tenancies", key: "id" },
        onDelete: "CASCADE",
      },
      inspectedById: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      type: {
        type: DataTypes.ENUM("move_in", "move_out"),
        allowNull: false,
      },
      inspectionDate: { type: DataTypes.DATEONLY, allowNull: false },
      items: { type: DataTypes.JSONB, defaultValue: [] },
      generalNotes: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM("draft", "completed"),
        defaultValue: "draft",
      },
      tenantAcknowledged: { type: DataTypes.BOOLEAN, defaultValue: false },
      tenantAcknowledgedAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex("inspections", ["ownerId"]);
    await queryInterface.addIndex("inspections", ["tenancyId"]);
    await queryInterface.addIndex("inspections", ["buildingId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("inspections");
  },
};
