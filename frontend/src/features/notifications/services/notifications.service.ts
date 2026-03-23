import { api } from "../../../app/config/axios.config";

export type NotificationType =
  | "project_assigned"
  | "progress_submitted"
  | "progress_reviewed"
  | "project_created"
  | "allocation_review_required"
  | "student_created"
  | "guide_created";

export interface NotificationItem {
  id: number;
  userId: number;
  projectId?: number | null;
  progressId?: number | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
  const { data } = await api.get("/notifications");
  return data?.data ?? { notifications: [], unreadCount: 0 };
}

export async function markNotificationRead(notificationId: number) {
  const { data } = await api.patch(`/notifications/${notificationId}/read`);
  return data?.data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch("/notifications/read-all");
  return data?.data;
}
