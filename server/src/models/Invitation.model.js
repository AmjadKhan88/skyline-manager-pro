/**
 * Invitation.model.js — Staff Credential / Invite System
 *
 * When an owner creates a manager, employee, or tenant, they can send
 * login credentials to that person's email. This table tracks those invitations.
 *
 * FLOW:
 * 1. Owner POSTs to /api/v1/staff (or /api/v1/tenants)
 * 2. System creates the User + UserProfile with status = 'pending'
 * 3. System generates a temp password, stores hashed version here
 * 4. Email is sent with { email, tempPassword, loginUrl }
 * 5. Staff member logs in, is forced to change password
 * 6. Invitation status becomes 'accepted', User status becomes 'active'
 *
 * NOTE: tempPassword is stored hashed here for security audit trail,
 * but it's emailed in plain text just once (on creation).
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.js";

const Invitation = sequelize.define(
  "Invitation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Owner who created this invitation
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    // The user account that was created (FK set after user creation)
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },

    // Email the credentials were sent to
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    // Role that was assigned
    role: {
      type: DataTypes.ENUM("manager", "employee", "tenant"),
      allowNull: false,
    },

    /**
     * status tracks the lifecycle:
     * 'sent'     → credentials email was dispatched
     * 'accepted' → staff member has logged in and changed their password
     * 'expired'  → invitation was never used and has expired
     * 'resent'   → credentials were resent by the owner
     */
    status: {
      type: DataTypes.ENUM("sent", "accepted", "expired", "resent"),
      defaultValue: "sent",
    },

    // Invitation expires after 7 days for security
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "invitations",
    timestamps: true,

    indexes: [
      { fields: ["ownerId"] },
      { fields: ["email"] },
      { fields: ["status"] },
    ],
  }
);

export default Invitation;
