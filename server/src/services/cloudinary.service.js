/**
 * services/cloudinary.service.js — Cloudinary Upload/Delete Helper
 *
 * Centralizes all Cloudinary operations so controllers never touch
 * the cloudinary SDK directly. Handles extracting public IDs from
 * full URLs for deletion — a common pain point.
 */

import cloudinary from "../configs/cloudinary.js";

/**
 * extractPublicId — Pull the Cloudinary public_id from a full Cloudinary URL.
 *
 * Cloudinary URLs look like:
 *   https://res.cloudinary.com/CLOUD/image/upload/v1234/folder/filename.jpg
 *
 * The public_id used for deletion is: "folder/filename" (no extension, no version)
 *
 * @param {string} url - Full Cloudinary URL
 * @returns {string} public_id for use in cloudinary.uploader.destroy()
 */
export const extractPublicId = (url) => {
  if (!url) return null;
  try {
    // Split on '/upload/' and take everything after it
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    // Remove the version prefix (v1234/) if present
    const afterUpload = parts[1].replace(/^v\d+\//, "");
    // Remove file extension
    const publicId = afterUpload.replace(/\.[^/.]+$/, "");
    return publicId;
  } catch {
    return null;
  }
};

/**
 * deleteFile — Remove a file from Cloudinary by its full URL.
 *
 * Safe to call even if the URL is null/undefined (just skips silently).
 * Used during staff deletion/update to clean up old avatar/cnic files.
 *
 * @param {string} url - Full Cloudinary URL to delete
 * @param {string} resourceType - 'image' (default) or 'raw' for documents
 */
export const deleteFile = async (url, resourceType = "image") => {
  if (!url) return;
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    // Log but don't throw — a failed Cloudinary delete shouldn't block the DB operation
    console.error(`[Cloudinary] Failed to delete ${publicId}:`, err.message);
  }
};

/**
 * deleteMultipleFiles — Batch delete multiple Cloudinary files.
 * @param {string[]} urls - Array of Cloudinary URLs
 */
export const deleteMultipleFiles = async (urls = []) => {
  await Promise.allSettled(urls.map((url) => deleteFile(url)));
};
