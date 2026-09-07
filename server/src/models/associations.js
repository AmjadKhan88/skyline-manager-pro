/**
 * associations.js — All Sequelize Model Relationships
 *
 * This is the single source of truth for every FK relationship in the system.
 * It must be imported ONCE (in models/index.js) before any query is made.
 *
 * RELATIONSHIP MAP:
 *
 *  User (owner) ─┬─ hasMany ──→ User (staff)        via ownerId
 *                ├─ hasOne  ──→ OwnerProfile         via userId
 *                ├─ hasMany ──→ Buildings             via ownerId
 *                ├─ hasMany ──→ Tenancies             via ownerId
 *                └─ hasMany ──→ Invitations           via ownerId
 *
 *  User (staff) ─┬─ belongsTo → User (owner)         via ownerId
 *                └─ hasOne   ──→ UserProfile          via userId
 *
 *  UserProfile  ──── belongsTo → Building             via buildingId
 *
 *  Building ────┬─ belongsTo → User (owner)           via ownerId
 *               ├─ belongsTo → User (manager)         via managerId
 *               ├─ hasMany  ──→ UserProfiles           via buildingId (assigned staff)
 *               └─ hasMany  ──→ Tenancies             via buildingId
 *
 *  Tenancy ─────┬─ belongsTo → User (tenant)          via tenantId
 *               ├─ belongsTo → Building               via buildingId
 *               └─ belongsTo → User (owner)           via ownerId
 */

import User from "./User.model.js";
import OwnerProfile from "./OwnerProfile.model.js";
import UserProfile from "./UserProfile.model.js";
import Building from "./Building.model.js";
import Tenancy from "./Tenancy.model.js";
import Invitation from "./Invitation.model.js";

// ─── 1. Owner Profile (1:1) ────────────────────────────────────────────────
User.hasOne(OwnerProfile, { foreignKey: "userId", as: "ownerProfile", onDelete: "CASCADE" });
OwnerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

// ─── 2. Staff Profile (1:1) ────────────────────────────────────────────────
User.hasOne(UserProfile, { foreignKey: "userId", as: "profile", onDelete: "CASCADE" });
UserProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

// ─── 3. Owner → Staff Hierarchy (1:many self-referencing) ─────────────────
// An owner can have many managers/employees/tenants under them
User.hasMany(User, { foreignKey: "ownerId", as: "staff", onDelete: "CASCADE" });
User.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// ─── 4. Owner → Buildings (1:many) ────────────────────────────────────────
User.hasMany(Building, { foreignKey: "ownerId", as: "buildings", onDelete: "CASCADE" });
Building.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// ─── 5. Manager → Building (1:many, optional assignment) ──────────────────
// One manager can be assigned to manage one building at a time
User.hasMany(Building, { foreignKey: "managerId", as: "managedBuildings" });
Building.belongsTo(User, { foreignKey: "managerId", as: "manager" });

// ─── 6. Building → Staff Profiles (1:many via buildingId in UserProfile) ──
// All staff profiles assigned to a specific building
Building.hasMany(UserProfile, { foreignKey: "buildingId", as: "staffProfiles", onDelete: "SET NULL" });
UserProfile.belongsTo(Building, { foreignKey: "buildingId", as: "building" });

// ─── 7. Tenancies (many-sided relationships) ───────────────────────────────
// Tenant user → their leases
User.hasMany(Tenancy, { foreignKey: "tenantId", as: "tenancies", onDelete: "CASCADE" });
Tenancy.belongsTo(User, { foreignKey: "tenantId", as: "tenant" });

// Building → tenants in it
Building.hasMany(Tenancy, { foreignKey: "buildingId", as: "tenancies", onDelete: "CASCADE" });
Tenancy.belongsTo(Building, { foreignKey: "buildingId", as: "building" });

// Owner → all tenancies across all their buildings
User.hasMany(Tenancy, { foreignKey: "ownerId", as: "managedTenancies", onDelete: "CASCADE" });
Tenancy.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// ─── 8. Invitations ────────────────────────────────────────────────────────
User.hasMany(Invitation, { foreignKey: "ownerId", as: "sentInvitations", onDelete: "CASCADE" });
Invitation.belongsTo(User, { foreignKey: "ownerId", as: "owner" });
User.hasMany(Invitation, { foreignKey: "userId", as: "receivedInvitations" });
Invitation.belongsTo(User, { foreignKey: "userId", as: "invitedUser" });

export { User, OwnerProfile, UserProfile, Building, Tenancy, Invitation };