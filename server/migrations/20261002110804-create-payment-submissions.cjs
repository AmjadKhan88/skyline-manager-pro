"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable("payment_submissions", {
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
      tenancyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "tenancies", key: "id" },
        onDelete: "CASCADE",
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      paymentAccountId: {
        type: DataTypes.UUID,
        allowNull: true, // nullable in case the account is later deleted — history still makes sense via `method`
        references: { model: "payment_accounts", key: "id" },
        onDelete: "SET NULL",
      },
      method: {
        // copied from the account at submission time, so history survives account edits/deletion
        type: DataTypes.ENUM("bank_transfer", "jazzcash", "easypaisa", "other"),
        allowNull: false,
      },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      periodMonth: { type: DataTypes.DATEONLY, allowNull: true }, // which month's rent this covers
      transactionReference: { type: DataTypes.STRING(100), allowNull: true },
      proofImageUrl: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      reviewedById: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      reviewNotes: { type: DataTypes.TEXT, allowNull: true },
      reviewedAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex("payment_submissions", ["ownerId"]);
    await queryInterface.addIndex("payment_submissions", ["tenancyId"]);
    await queryInterface.addIndex("payment_submissions", ["tenantId"]);
    await queryInterface.addIndex("payment_submissions", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("payment_submissions");
  },
};
