import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database";

export class Guide extends Model{}

Guide.init({
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
    },
    fullName:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    linkedin: {
      type: DataTypes.STRING,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    departmentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    qualification: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    expertise: {
      type: DataTypes.JSON, 
      allowNull: false,
    },
},
{
    sequelize,
    tableName: "guides",
    timestamps: true,
})
