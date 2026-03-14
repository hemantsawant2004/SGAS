"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMember = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class ProjectMember extends sequelize_1.Model {
}
exports.ProjectMember = ProjectMember;
ProjectMember.init({
    projectId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    studentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
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
});
