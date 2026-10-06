"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.addColumn("tenancies", "billingDueDay", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // day of month rent is due, 1-28
    });
    await queryInterface.addColumn("tenancies", "gracePeriodDays", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    });
    await queryInterface.addColumn("tenancies", "lateFeeType", {
      type: DataTypes.ENUM("none", "fixed", "percent"),
      allowNull: false,
      defaultValue: "none",
    });
    await queryInterface.addColumn("tenancies", "lateFeeValue", {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("tenancies", "billingDueDay");
    await queryInterface.removeColumn("tenancies", "gracePeriodDays");
    await queryInterface.removeColumn("tenancies", "lateFeeType");
    await queryInterface.removeColumn("tenancies", "lateFeeValue");
  },
};
