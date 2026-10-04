"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable("lease_signatures", {
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
      signerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      signerRole: {
        type: DataTypes.ENUM("tenant", "owner", "manager"),
        allowNull: false,
      },
      signatureImageUrl: { type: DataTypes.STRING, allowNull: false },
      typedName: { type: DataTypes.STRING(150), allowNull: false },
      ipAddress: { type: DataTypes.STRING(64), allowNull: true },
      agreedAt: { type: DataTypes.DATE, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex("lease_signatures", ["ownerId"]);
    await queryInterface.addIndex("lease_signatures", ["tenancyId"]);
    // A given person signs a given tenancy at most once — re-signing isn't a thing;
    // if a lease needs re-signing, that's a new Tenancy record (a renewal), not a new signature on the old one.
    await queryInterface.addIndex(
      "lease_signatures",
      ["tenancyId", "signerId"],
      { unique: true },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("lease_signatures");
  },
};
