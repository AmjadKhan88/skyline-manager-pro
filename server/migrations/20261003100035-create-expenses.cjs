"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable("expenses", {
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
      recordedById: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
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
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex("expenses", ["ownerId"]);
    await queryInterface.addIndex("expenses", ["buildingId"]);
    await queryInterface.addIndex("expenses", ["category"]);
    await queryInterface.addIndex("expenses", ["expenseDate"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("expenses");
  },
};
