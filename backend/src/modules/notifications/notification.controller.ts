import { Request, Response } from "express";
import {
  getMyNotificationsService,
  markAllNotificationsReadService,
  markNotificationReadService,
} from "./notification.service";

export const getMyNotificationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getMyNotificationsService(req.user!);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markNotificationReadController = async (
  req: Request,
  res: Response
) => {
  try {
    const notificationId = Number(req.params.notificationId);
    const notification = await markNotificationReadService(
      notificationId,
      req.user!
    );

    res.json({ success: true, data: notification });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAllNotificationsReadController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await markAllNotificationsReadService(req.user!);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
