"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // ── users ─────────────────────────────────────────────────────────────
    await queryInterface.createTable("users", {
      id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: true },
      role: {
        type: DataTypes.ENUM("owner", "manager", "employee", "tenant"),
        allowNull: false,
        defaultValue: "owner",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "pending"),
        defaultValue: "pending",
      },
      verified: { type: DataTypes.BOOLEAN, defaultValue: false },
      googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: true, // NULL for owners themselves — the fix that broke signup before
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      mustChangePassword: { type: DataTypes.BOOLEAN, defaultValue: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE }, // paranoid: true
    });
    await queryInterface.addIndex("users", ["role"]);
    await queryInterface.addIndex("users", ["ownerId"]);
    await queryInterface.addIndex("users", ["status"]);

    // ── owner_profiles ───────────────────────────────────────────────────
    await queryInterface.createTable("owner_profiles", {
      id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      businessName: { type: DataTypes.STRING(200), allowNull: true },
      businessAddress: { type: DataTypes.TEXT, allowNull: true },
      taxId: { type: DataTypes.STRING(50), allowNull: true },
      phone: { type: DataTypes.STRING(20), allowNull: true },
      avatar: { type: DataTypes.STRING, allowNull: true },
      subscriptionPlan: {
        type: DataTypes.ENUM("basic", "pro", "enterprise"),
        defaultValue: "basic",
      },
      maxBuildings: { type: DataTypes.INTEGER, defaultValue: 3 },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    // ── buildings ─────────────────────────────────────────────────────────
    await queryInterface.createTable("buildings", {
      id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      address: { type: DataTypes.STRING(300), allowNull: false },
      city: { type: DataTypes.STRING(100), allowNull: true },
      buildingType: {
        type: DataTypes.ENUM(
          "residential", "commercial", "industrial",
          "mixed-use", "educational", "healthcare"
        ),
        defaultValue: "residential",
      },
      floors: { type: DataTypes.INTEGER, allowNull: true },
      units: { type: DataTypes.INTEGER, allowNull: true },
      status: {
        type: DataTypes.ENUM(
          "planning", "under-construction", "completed",
          "occupied", "renovating", "operational"
        ),
        defaultValue: "operational",
      },
      occupancy: { type: DataTypes.FLOAT, defaultValue: 0 },
      energyRating: {
        type: DataTypes.ENUM("A", "B", "C", "D", "E", "F", "G"),
        allowNull: true,
      },
      greenCertification: {
        type: DataTypes.ENUM("LEED", "BREEAM", "WELL", "ENERGY_STAR", "none"),
        defaultValue: "none",
      },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      managerId: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      extraFields: { type: DataTypes.JSONB, defaultValue: [] },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE }, // paranoid: true
    });
    await queryInterface.addIndex("buildings", ["ownerId"]);
    await queryInterface.addIndex("buildings", ["managerId"]);
    await queryInterface.addIndex("buildings", ["buildingType"]);
    await queryInterface.addIndex("buildings", ["status"]);

    // ── user_profiles ─────────────────────────────────────────────────────
    await queryInterface.createTable("user_profiles", {
      id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      phone: { type: DataTypes.STRING(20), allowNull: true },
      avatar: { type: DataTypes.STRING, allowNull: true },
      cnic: { type: DataTypes.STRING, allowNull: true },
      salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      jobTitle: { type: DataTypes.STRING(100), allowNull: true },
      buildingId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "buildings", key: "id" },
        onDelete: "SET NULL",
      },
      extraFields: { type: DataTypes.JSONB, defaultValue: [] },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("user_profiles", ["buildingId"]);

    // ── tenancies ─────────────────────────────────────────────────────────
    await queryInterface.createTable("tenancies", {
      id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      tenantId: {
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
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      unitNumber: { type: DataTypes.STRING(50), allowNull: false },
      monthlyRent: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      depositAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      leaseStart: { type: DataTypes.DATEONLY, allowNull: false },
      leaseEnd: { type: DataTypes.DATEONLY, allowNull: true },
      paymentStatus: {
        type: DataTypes.ENUM("paid", "unpaid", "overdue", "partial"),
        defaultValue: "unpaid",
      },
      status: {
        type: DataTypes.ENUM("active", "terminated", "pending"),
        defaultValue: "pending",
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: { type: DataTypes.DATE }, // paranoid: true
    });
    await queryInterface.addIndex("tenancies", ["ownerId"]);
    await queryInterface.addIndex("tenancies", ["buildingId"]);
    await queryInterface.addIndex("tenancies", ["tenantId"]);
    await queryInterface.addIndex("tenancies", ["paymentStatus"]);

    // ── invitations ───────────────────────────────────────────────────────
    await queryInterface.createTable("invitations", {
      id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      email: { type: DataTypes.STRING(150), allowNull: false },
      role: {
        type: DataTypes.ENUM("manager", "employee", "tenant"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("sent", "accepted", "expired", "resent"),
        defaultValue: "sent",
      },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex("invitations", ["ownerId"]);
    await queryInterface.addIndex("invitations", ["email"]);
    await queryInterface.addIndex("invitations", ["status"]);
  },

  async down(queryInterface) {
    // Drop in reverse dependency order
    await queryInterface.dropTable("invitations");
    await queryInterface.dropTable("tenancies");
    await queryInterface.dropTable("user_profiles");
    await queryInterface.dropTable("buildings");
    await queryInterface.dropTable("owner_profiles");
    await queryInterface.dropTable("users");
  },
};