import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

export const NOTIFICATION_TYPES = [
  "project_assigned",
  "progress_submitted",
  "progress_reviewed",
  "project_created",
  "allocation_review_required",
  "student_created",
  "guide_created",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

interface NotificationAttributes {
  id: number;
  userId: number;
  projectId: number | null;
  progressId: number | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: Date | null;
}

interface NotificationCreationAttributes
  extends Optional<
    NotificationAttributes,
    "id" | "projectId" | "progressId" | "isRead" | "readAt"
  > {}

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public userId!: number;
  public projectId!: number | null;
  public progressId!: number | null;
  public type!: NotificationType;
  public title!: string;
  public message!: string;
  public isRead!: boolean;
  public readAt!: Date | null;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    progressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    type: {
      type: DataTypes.ENUM(...NOTIFICATION_TYPES),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: true,
    indexes: [
      {
        fields: ["userId", "isRead", "createdAt"],
      },
    ],
  }
);
