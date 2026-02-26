import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class User extends Model {
  declare id: number;
  declare username: string;
  declare password: string | null;
  declare given_name: string;
  declare role: "admin" | "guide" | "student";
  declare refresh_token_hash: string | null;
  declare refresh_token_expires_at: Date | null;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    given_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("admin", "guide", "student"),
      allowNull: false,
      defaultValue: "admin",
    },

    refresh_token_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    refresh_token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    class: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    division: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    rollNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    indexes: [
      {
        name: "uq_users_class_division_roll",
        unique: true,
        fields: ["class", "division", "rollNumber"],
      },
    ],
  }
);
