"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("payment_submissions", "rentChargeId", {
      type: Sequelize.DataTypes.UUID,
      allowNull: true, // nullable for backward compat with submissions made before this feature existed
      references: { model: "rent_charges", key: "id" },
      onDelete: "SET NULL",
    });
    await queryInterface.addIndex("payment_submissions", ["rentChargeId"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("payment_submissions", ["rentChargeId"]);
    await queryInterface.removeColumn("payment_submissions", "rentChargeId");
  },
};
