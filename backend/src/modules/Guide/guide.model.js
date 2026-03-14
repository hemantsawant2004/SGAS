"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guide = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Guide extends sequelize_1.Model {
}
exports.Guide = Guide;
Guide.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fullName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        unique: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    linkedin: {
        type: sequelize_1.DataTypes.STRING,
    },
    bio: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    departmentName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    qualification: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    experience: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    expertise: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    maxProjects: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "guides",
    timestamps: true,
});
