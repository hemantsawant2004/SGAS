import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import {
  getMyNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from "./notification.controller";

const notificationRoutes = Router();

notificationRoutes.use(requireAuth);
notificationRoutes.get("/", getMyNotificationsController);
notificationRoutes.patch("/read-all", markAllNotificationsReadController);
notificationRoutes.patch("/:notificationId/read", markNotificationReadController);

export default notificationRoutes;
