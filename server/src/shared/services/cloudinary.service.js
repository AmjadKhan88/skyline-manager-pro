/**
 * shared/services/cloudinary.service.js — Cloudinary Upload/Delete Helper
 */

import cloudinary from "../../config/cloudinary.js";

/**
 * extractPublicId — Pull the Cloudinary public_id from a full Cloudinary URL.
 */
export const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const afterUpload = parts[1].replace(/^v\d+\//, "");
    const publicId = afterUpload.replace(/\.[^/.]+$/, "");
    return publicId;
  } catch {
    return null;
  }
};

/**
 * deleteFile — Remove a file from Cloudinary by its full URL.
 */
export const deleteFile = async (url, resourceType = "image") => {
  if (!url) return;
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error(`[Cloudinary] Failed to delete ${publicId}:`, err.message);
  }
};

/**
 * deleteMultipleFiles — Batch delete multiple Cloudinary files.
 */
export const deleteMultipleFiles = async (urls = []) => {
  await Promise.allSettled(urls.map((url) => deleteFile(url)));
};