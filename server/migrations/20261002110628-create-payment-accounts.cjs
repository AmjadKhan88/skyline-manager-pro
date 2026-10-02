"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable("payment_accounts", {
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
      method: {
        type: DataTypes.ENUM("bank_transfer", "jazzcash", "easypaisa", "other"),
        allowNull: false,
      },
      label: { type: DataTypes.STRING(100), allowNull: false }, // e.g. "Main HBL Account"
      accountTitle: { type: DataTypes.STRING(150), allowNull: false },
      accountNumber: { type: DataTypes.STRING(50), allowNull: false },
      bankName: { type: DataTypes.STRING(100), allowNull: true }, // bank_transfer only
      iban: { type: DataTypes.STRING(50), allowNull: true }, // bank_transfer only
      qrCodeUrl: { type: DataTypes.STRING, allowNull: true },
      instructions: { type: DataTypes.TEXT, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex("payment_accounts", ["ownerId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("payment_accounts");
  },
};
