import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../config/database";

interface ProjectAttributes {
  id: number;
  title: string;
  description: string;
  technology: string;
  studentId: number;
  preferredGuideId: number | null;
  guideId: number | null;
}

interface ProjectCreationAttributes
  extends Optional<ProjectAttributes, "id" | "preferredGuideId"> {}

export class Project
  extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public technology!: string;
  public studentId!: number;
  public preferredGuideId!: number | null;
  public guideId!: number | null;
}

Project.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    technology: { type: DataTypes.STRING, allowNull: false },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    preferredGuideId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    guideId: {
  type: DataTypes.INTEGER,
  allowNull: true,
},
  },
  {
    sequelize,
    tableName: "projects",
    timestamps: true,
  }
);
