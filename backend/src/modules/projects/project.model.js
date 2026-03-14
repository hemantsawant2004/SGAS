"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Project extends sequelize_1.Model {
}
exports.Project = Project;
Project.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    technology: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    studentId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    preferredGuideId: { type: sequelize_1.DataTypes.INTEGER, allowNull: true, defaultValue: null },
    guideId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "projects",
    timestamps: true,
});
