"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectProgress = exports.PROJECT_PROGRESS_REMARK_STATUSES = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
const project_model_1 = require("./project.model");
exports.PROJECT_PROGRESS_REMARK_STATUSES = [
    "pending",
    "needs_changes",
    "completed",
];
class ProjectProgress extends sequelize_1.Model {
}
exports.ProjectProgress = ProjectProgress;
ProjectProgress.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    projectId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    studentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    phase: {
        type: sequelize_1.DataTypes.ENUM(...project_model_1.PROJECT_PHASES),
        allowNull: false,
    },
    progressText: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
    },
    guideReply: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    remarkStatus: {
        type: sequelize_1.DataTypes.ENUM(...exports.PROJECT_PROGRESS_REMARK_STATUSES),
        allowNull: false,
        defaultValue: "pending",
    },
    reviewedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    fileName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    fileUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    fileMimeType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    fileSize: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "project_progress",
    timestamps: true,
});
