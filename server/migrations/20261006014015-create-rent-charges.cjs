"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable("rent_charges", {
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
      periodMonth: { type: DataTypes.DATEONLY, allowNull: false }, // always the 1st of the billing month
      dueDate: { type: DataTypes.DATEONLY, allowNull: false },
      baseAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      appliedLateFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      amountPaid: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      status: {
        type: DataTypes.ENUM("pending", "partial", "paid", "overdue", "waived"),
        defaultValue: "pending",
      },
      paidAt: { type: DataTypes.DATE, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex("rent_charges", ["ownerId"]);
    await queryInterface.addIndex("rent_charges", ["tenancyId"]);
    await queryInterface.addIndex("rent_charges", ["buildingId"]);
    await queryInterface.addIndex("rent_charges", ["status"]);
    // One charge per tenancy per billing month — the generator checks this before creating a new one
    await queryInterface.addIndex(
      "rent_charges",
      ["tenancyId", "periodMonth"],
      { unique: true },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("rent_charges");
  },
};
