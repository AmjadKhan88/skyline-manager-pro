"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("maintenance_requests", "assignedVendorId", {
      type: Sequelize.DataTypes.UUID,
      allowNull: true,
      references: { model: "vendors", key: "id" },
      onDelete: "SET NULL",
    });
    await queryInterface.addIndex("maintenance_requests", ["assignedVendorId"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("maintenance_requests", [
      "assignedVendorId",
    ]);
    await queryInterface.removeColumn(
      "maintenance_requests",
      "assignedVendorId",
    );
  },
};
