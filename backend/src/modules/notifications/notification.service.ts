import { sequelize } from "../../config/database";
import { AuthUser } from "../../types/express";
import { User } from "../user/user.models";
import {
  NOTIFICATION_TYPES,
  Notification,
  NotificationType,
} from "./notification.model";

type NotificationInput = {
  userId: number;
  projectId?: number | null;
  progressId?: number | null;
  type: NotificationType;
  title: string;
  message: string;
};

export const syncNotificationTable = async () => {
  await Notification.sync();
  const enumValues = NOTIFICATION_TYPES.map((type) => `'${type}'`).join(", ");
  await sequelize.query(
    `ALTER TABLE notifications MODIFY COLUMN type ENUM(${enumValues}) NOT NULL`
  );
};

export const createNotification = async (payload: NotificationInput) => {
  return Notification.create({
    userId: payload.userId,
    projectId: payload.projectId ?? null,
    progressId: payload.progressId ?? null,
    type: payload.type,
    title: payload.title,
    message: payload.message,
  });
};

export const createNotifications = async (payloads: NotificationInput[]) => {
  if (!payloads.length) return [];

  return Notification.bulkCreate(
    payloads.map((payload) => ({
      userId: payload.userId,
      projectId: payload.projectId ?? null,
      progressId: payload.progressId ?? null,
      type: payload.type,
      title: payload.title,
      message: payload.message,
    }))
  );
};

export const createAdminNotifications = async (
  payloads: Omit<NotificationInput, "userId">[]
) => {
  if (!payloads.length) return [];

  const admins = await User.findAll({
    where: { role: "admin" },
    attributes: ["id"],
  });

  if (!admins.length) return [];

  return createNotifications(
    admins.flatMap((admin) =>
      payloads.map((payload) => ({
        ...payload,
        userId: admin.id,
      }))
    )
  );
};

export const getMyNotificationsService = async (authUser: AuthUser) => {
  const notifications = await Notification.findAll({
    where: { userId: authUser.id },
    order: [["createdAt", "DESC"]],
    limit: 50,
  });

  const unreadCount = await Notification.count({
    where: { userId: authUser.id, isRead: false },
  });

  return {
    notifications,
    unreadCount,
  };
};

export const markNotificationReadService = async (
  notificationId: number,
  authUser: AuthUser
) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, userId: authUser.id },
  });

  if (!notification) {
    throw new Error("Notification not found.");
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return notification;
};

export const markAllNotificationsReadService = async (authUser: AuthUser) => {
  await Notification.update(
    {
      isRead: true,
      readAt: new Date(),
    },
    {
      where: {
        userId: authUser.id,
        isRead: false,
      },
    }
  );

  return { success: true };
};
