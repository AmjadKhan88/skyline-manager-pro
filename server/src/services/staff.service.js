/**
 * services/staff.service.js — Staff Management Business Logic
 *
 * Handles the complex operations for creating/updating/deleting manager,
 * employee, and tenant user accounts together with their UserProfile records.
 * Extracted from controllers to keep them thin and testable.
 *
 * KEY RESPONSIBILITY:
 * Every operation here enforces the ownerId isolation — staff records are always
 * created under the calling owner's ID and can only be modified/deleted by that owner.
 */

import { User, UserProfile } from "../models/index.js";
import { deleteMultipleFiles } from "./cloudinary.service.js";

/**
 * createStaffWithProfile — Create a User + UserProfile in a single transaction.
 *
 * Used by staff.controller and tenant.controller when an owner adds new staff.
 * The user is created with status='pending' and mustChangePassword=true so
 * they are forced to set a new password on first login.
 *
 * @param {object} opts
 * @param {string} opts.ownerId        - The owner's user ID (from req.scopedOwnerId)
 * @param {string} opts.name           - Staff member's full name
 * @param {string} opts.email          - Staff member's email
 * @param {string} opts.tempPassword   - Plain-text temp password (will be hashed by hook)
 * @param {string} opts.role           - 'manager' | 'employee' | 'tenant'
 * @param {object} opts.profileData    - { phone, salary, jobTitle, buildingId, extraFields }
 * @param {object} opts.files          - Uploaded files { avatar, cnic } (Cloudinary paths)
 * @returns {{ user: User, profile: UserProfile }}
 */
export const createStaffWithProfile = async ({
  ownerId,
  name,
  email,
  tempPassword,
  role,
  profileData = {},
  files = {},
}) => {
  // Step 1: Create the User record (password auto-hashed via beforeCreate hook)
  const user = await User.create({
    name,
    email,
    password: tempPassword,
    role,
    ownerId,
    status: "pending",        // Pending until first login
    mustChangePassword: true, // Force password change on first login
    verified: true,           // Staff don't need email verification (owner vouched for them)
  });

  // Step 2: Create associated UserProfile
  const profile = await UserProfile.create({
    userId: user.id,
    phone: profileData.phone || null,
    salary: profileData.salary || null,
    jobTitle: profileData.jobTitle || null,
    buildingId: profileData.buildingId || null,
    extraFields: profileData.extraFields || [],
    avatar: files.avatar || null,
    cnic: files.cnic || null,
  });

  return { user, profile };
};

/**
 * updateStaffWithProfile — Update User + UserProfile fields atomically.
 *
 * Only updates fields that are provided (undefined fields are skipped).
 * Handles Cloudinary file replacement: deletes old file before storing new URL.
 *
 * @param {object} opts
 * @param {User} opts.user             - Existing User instance
 * @param {UserProfile} opts.profile   - Existing UserProfile instance
 * @param {object} opts.updateData     - Fields to update { name, email, status, ... }
 * @param {object} opts.profileData    - Profile fields { phone, salary, jobTitle, ... }
 * @param {object} opts.files          - New uploaded files { avatar?, cnic? }
 */
export const updateStaffWithProfile = async ({
  user,
  profile,
  updateData = {},
  profileData = {},
  files = {},
}) => {
  // Update base user fields
  if (updateData.name !== undefined) user.name = updateData.name;
  if (updateData.email !== undefined) user.email = updateData.email;
  if (updateData.status !== undefined) user.status = updateData.status;
  if (updateData.password) {
    user.password = updateData.password; // beforeUpdate hook will re-hash
    user.mustChangePassword = false;
  }
  await user.save();

  // Update profile fields
  if (profileData.phone !== undefined) profile.phone = profileData.phone;
  if (profileData.salary !== undefined) profile.salary = profileData.salary;
  if (profileData.jobTitle !== undefined) profile.jobTitle = profileData.jobTitle;
  if (profileData.buildingId !== undefined) profile.buildingId = profileData.buildingId;
  if (profileData.extraFields !== undefined) profile.extraFields = profileData.extraFields;

  // Handle avatar replacement: delete old Cloudinary file first
  if (files.avatar) {
    await deleteMultipleFiles([profile.avatar]); // Delete old
    profile.avatar = files.avatar;
  }

  // Handle CNIC replacement
  if (files.cnic) {
    await deleteMultipleFiles([profile.cnic]); // Delete old
    profile.cnic = files.cnic;
  }

  await profile.save();
  return { user, profile };
};

/**
 * deleteStaffWithCleanup — Delete User + UserProfile + Cloudinary assets.
 *
 * Order matters: delete Cloudinary files first (they don't cascade),
 * then destroy DB records (profile cascades from user via FK).
 *
 * @param {User} user          - User instance to delete
 * @param {UserProfile} profile - UserProfile instance to delete
 */
export const deleteStaffWithCleanup = async (user, profile) => {
  // 1. Remove uploaded files from Cloudinary
  if (profile) {
    await deleteMultipleFiles([profile.avatar, profile.cnic]);
    await profile.destroy();
  }

  // 2. Soft-delete the user record (paranoid: true sets deletedAt)
  await user.destroy();
};

/**
 * findStaffByIdScoped — Safely fetch a staff member and verify ownership.
 *
 * Prevents an owner from modifying staff that belong to a different owner
 * by checking both the ID AND the ownerId in the WHERE clause.
 *
 * @param {string} staffId        - The staff user's UUID
 * @param {string} scopedOwnerId  - req.scopedOwnerId from tenantScope middleware
 * @returns {{ user: User, profile: UserProfile } | null}
 */
export const findStaffByIdScoped = async (staffId, scopedOwnerId) => {
  const user = await User.findOne({
    where: { id: staffId, ownerId: scopedOwnerId },
    include: [{ model: UserProfile, as: "profile" }],
  });
  return user;
};
