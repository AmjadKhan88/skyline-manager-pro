"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable("vendors", {
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
      name: { type: DataTypes.STRING(150), allowNull: false },
      companyName: { type: DataTypes.STRING(150), allowNull: true },
      phone: { type: DataTypes.STRING(20), allowNull: true },
      email: { type: DataTypes.STRING(150), allowNull: true },
      specialty: {
        type: DataTypes.ENUM(
          "plumbing",
          "electrical",
          "hvac",
          "appliance",
          "structural",
          "pest-control",
          "general",
        ),
        defaultValue: "general",
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex("vendors", ["ownerId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("vendors");
  },
};
