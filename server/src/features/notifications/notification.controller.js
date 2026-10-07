import { Notification } from "../../models/index.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const offset = (page - 1) * limit;

  const where = { recipientId: req.user.id };
  if (unreadOnly === "true") where.isRead = false;

  const [{ count, rows }, unreadCount] = await Promise.all([
    Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    }),
    Notification.count({ where: { recipientId: req.user.id, isRead: false } }),
  ]);

  return ApiResponse.success(res, 200, "Notifications fetched.", {
    notifications: rows,
    unreadCount,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    where: { id: req.params.id, recipientId: req.user.id },
  });
  if (!notification)
    return ApiResponse.error(res, 404, "Notification not found.");

  notification.isRead = true;
  await notification.save();
  return ApiResponse.success(res, 200, "Marked as read.");
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.update(
    { isRead: true },
    { where: { recipientId: req.user.id, isRead: false } },
  );
  return ApiResponse.success(res, 200, "All marked as read.");
});
