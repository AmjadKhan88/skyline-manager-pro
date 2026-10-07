/**
 * shared/services/notification.service.js — Reusable notification creation
 *
 * Any controller that produces an event another role should know about calls
 * notifyUser() (or notifyUsers() for broadcasting to several people). This is
 * the ONE place notification creation logic lives — keeps every call site a
 * one-liner and means future event types never need their own plumbing.
 */

import { Notification } from "../../models/index.js";

export const notifyUser = async ({
  ownerId,
  recipientId,
  type,
  title,
  message,
  link,
}) => {
  if (!recipientId) return; // silently no-op if there's no one to notify yet (e.g. unassigned building)
  try {
    await Notification.create({
      ownerId,
      recipientId,
      type,
      title,
      message,
      link: link || null,
    });
  } catch (err) {
    // A failed notification should never break the action that triggered it
    console.error("[notification] failed to create:", err.message);
  }
};

export const notifyUsers = async (recipientIds, payload) => {
  await Promise.all(
    [...new Set(recipientIds.filter(Boolean))].map((recipientId) =>
      notifyUser({ ...payload, recipientId }),
    ),
  );
};
