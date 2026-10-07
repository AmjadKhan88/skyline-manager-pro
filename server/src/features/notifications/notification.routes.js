import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "./notification.controller.js";

const router = express.Router();

router.use(authenticate); // no tenantScope/authorize — any authenticated role reads only their own, no role restriction needed

router.get("/", getMyNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

export default router;
