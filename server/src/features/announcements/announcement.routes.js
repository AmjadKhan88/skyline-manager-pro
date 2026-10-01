import express from "express";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { tenantScope } from "../../shared/middlewares/tenantScope.js";
import { validateBody } from "../../shared/middlewares/validate.middleware.js";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from "./announcement.validator.js";
import {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "./announcement.controller.js";

const router = express.Router();

router.use(authenticate, tenantScope);

router.get("/", getAllAnnouncements);
router.post(
  "/",
  authorize("owner", "manager"),
  validateBody(createAnnouncementSchema),
  createAnnouncement,
);
router.put(
  "/:id",
  authorize("owner", "manager"),
  validateBody(updateAnnouncementSchema),
  updateAnnouncement,
);
router.delete("/:id", authorize("owner", "manager"), deleteAnnouncement);

export default router;
