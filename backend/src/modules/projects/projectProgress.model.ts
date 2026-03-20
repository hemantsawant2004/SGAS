import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";
import { PROJECT_PHASES } from "./project.model";

export const PROJECT_PROGRESS_REMARK_STATUSES = [
  "pending",
  "needs_changes",
  "completed",
] as const;

export type ProjectProgressRemarkStatus =
  (typeof PROJECT_PROGRESS_REMARK_STATUSES)[number];

export type ProjectPhase = (typeof PROJECT_PHASES)[number];

interface ProjectProgressAttributes {
  id: number;
  projectId: number;
  studentId: number;
  phase: ProjectPhase;
  progressText: string;
  guideReply: string | null;
  remarkStatus: ProjectProgressRemarkStatus;
  reviewedAt: Date | null;
  fileName: string | null;
  fileUrl: string | null;
  fileMimeType: string | null;
  fileSize: number | null;
}

interface ProjectProgressCreationAttributes
  extends Optional<
    ProjectProgressAttributes,
    | "id"
    | "guideReply"
    | "remarkStatus"
    | "reviewedAt"
    | "fileName"
    | "fileUrl"
    | "fileMimeType"
    | "fileSize"
  > {}

export class ProjectProgress
  extends Model<ProjectProgressAttributes, ProjectProgressCreationAttributes>
  implements ProjectProgressAttributes
{
  public id!: number;
  public projectId!: number;
  public studentId!: number;
  public phase!: ProjectPhase;
  public progressText!: string;
  public guideReply!: string | null;
  public remarkStatus!: ProjectProgressRemarkStatus;
  public reviewedAt!: Date | null;
  public fileName!: string | null;
  public fileUrl!: string | null;
  public fileMimeType!: string | null;
  public fileSize!: number | null;
}

ProjectProgress.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    phase: {
      type: DataTypes.ENUM(...PROJECT_PHASES),
      allowNull: false,
    },
    progressText: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    guideReply: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    remarkStatus: {
      type: DataTypes.ENUM(...PROJECT_PROGRESS_REMARK_STATUSES),
      allowNull: false,
      defaultValue: "pending",
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    fileMimeType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "project_progress",
    timestamps: true,
  }
);
