import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class ProjectMember extends Model {
  public id!: number;
  public projectId!: number;
  public studentId!: number;
}

ProjectMember.init(
  {
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "project_members",
    timestamps: false,
    indexes: [
      {
        name: "uq_project_members_student_id",
        unique: true,
        fields: ["studentId"],
      },
      {
        name: "uq_project_members_project_student",
        unique: true,
        fields: ["projectId", "studentId"],
      },
    ],
  }
);
