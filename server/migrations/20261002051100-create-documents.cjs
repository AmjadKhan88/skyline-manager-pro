"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable("documents", {
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
        // which building this relates to — optional (e.g. a tenant's personal ID isn't building-specific)
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "buildings", key: "id" },
        onDelete: "CASCADE",
      },
      tenancyId: {
        // set for lease documents
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "tenancies", key: "id" },
        onDelete: "CASCADE",
      },
      subjectUserId: {
        // whose personal document this is (ID, insurance) — the tenant/staff member it's about
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      uploadedById: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      title: { type: DataTypes.STRING(200), allowNull: false },
      category: {
        type: DataTypes.ENUM(
          "lease",
          "id_proof",
          "insurance",
          "inspection",
          "permit",
          "financial",
          "other",
        ),
        defaultValue: "other",
      },
      fileUrl: { type: DataTypes.STRING, allowNull: false },
      fileType: { type: DataTypes.STRING(20), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex("documents", ["ownerId"]);
    await queryInterface.addIndex("documents", ["buildingId"]);
    await queryInterface.addIndex("documents", ["tenancyId"]);
    await queryInterface.addIndex("documents", ["subjectUserId"]);
    await queryInterface.addIndex("documents", ["category"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("documents");
  },
};
