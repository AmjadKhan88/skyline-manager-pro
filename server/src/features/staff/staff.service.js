/**
 * features/staff/staff.service.js — Staff Management Business Logic
 *
 * Handles creating/updating/deleting manager, employee, and tenant user
 * accounts together with their UserProfile records.
 */

import { User, UserProfile } from "../../models/index.js";
import { deleteMultipleFiles } from "../../shared/services/cloudinary.service.js";

/**
 * createStaffWithProfile — Create a User + UserProfile.
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
  const user = await User.create({
    name,
    email,
    password: tempPassword,
    role,
    ownerId,
    status: "pending",
    mustChangePassword: true,
    verified: true,
  });

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
 */
export const updateStaffWithProfile = async ({
  user,
  profile,
  updateData = {},
  profileData = {},
  files = {},
}) => {
  if (updateData.name !== undefined) user.name = updateData.name;
  if (updateData.email !== undefined) user.email = updateData.email;
  if (updateData.status !== undefined) user.status = updateData.status;
  if (updateData.password) {
    user.password = updateData.password;
    user.mustChangePassword = false;
  }
  await user.save();

  if (profileData.phone !== undefined) profile.phone = profileData.phone;
  if (profileData.salary !== undefined) profile.salary = profileData.salary;
  if (profileData.jobTitle !== undefined) profile.jobTitle = profileData.jobTitle;
  if (profileData.buildingId !== undefined) profile.buildingId = profileData.buildingId;
  if (profileData.extraFields !== undefined) profile.extraFields = profileData.extraFields;

  if (files.avatar) {
    await deleteMultipleFiles([profile.avatar]);
    profile.avatar = files.avatar;
  }

  if (files.cnic) {
    await deleteMultipleFiles([profile.cnic]);
    profile.cnic = files.cnic;
  }

  await profile.save();
  return { user, profile };
};

/**
 * deleteStaffWithCleanup — Delete User + UserProfile + Cloudinary assets.
 */
export const deleteStaffWithCleanup = async (user, profile) => {
  if (profile) {
    await deleteMultipleFiles([profile.avatar, profile.cnic]);
    await profile.destroy();
  }

  await user.destroy();
};

/**
 * findStaffByIdScoped — Safely fetch a staff member and verify ownership.
 */
export const findStaffByIdScoped = async (staffId, scopedOwnerId) => {
  const user = await User.findOne({
    where: { id: staffId, ownerId: scopedOwnerId },
    include: [{ model: UserProfile, as: "profile" }],
  });
  return user;
};