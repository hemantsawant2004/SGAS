"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const DEFAULT_PHASE_STATUSES = JSON.stringify([
    { phase: "intro", status: "pending" },
    { phase: "system analysis", status: "pending" },
    { phase: "system design", status: "pending" },
    { phase: "reports", status: "pending" },
    { phase: "rough documentation", status: "pending" },
    { phase: "final submission", status: "pending" },
]);
async function addColumnIfMissing(tableName, columnName, definition) {
    const queryInterface = database_1.sequelize.getQueryInterface();
    const table = await queryInterface.describeTable(tableName);
    if (!table[columnName]) {
        await queryInterface.addColumn(tableName, columnName, definition);
        console.log(`Added ${tableName}.${columnName}`);
        return;
    }
    console.log(`${tableName}.${columnName} already exists`);
}
async function syncProjectPhaseSchema() {
    await database_1.sequelize.authenticate();
    const queryInterface = database_1.sequelize.getQueryInterface();
    const projectsTable = await queryInterface.describeTable("projects");
    if (!projectsTable.phaseStatuses) {
        await queryInterface.addColumn("projects", "phaseStatuses", {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            defaultValue: JSON.parse(DEFAULT_PHASE_STATUSES),
        });
        console.log("Added projects.phaseStatuses");
    }
    else {
        console.log("projects.phaseStatuses already exists");
    }
    const allTables = await queryInterface.showAllTables();
    const normalizedTables = allTables.map((table) => typeof table === "string" ? table : String(table.tableName ?? table));
    if (!normalizedTables.includes("project_progress")) {
        await queryInterface.createTable("project_progress", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            projectId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "projects",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            studentId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            phase: {
                type: sequelize_1.DataTypes.ENUM("intro", "system analysis", "system design", "reports", "rough documentation", "final submission"),
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
                type: sequelize_1.DataTypes.ENUM("pending", "needs_changes", "completed"),
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
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
        });
        console.log("Created project_progress table");
    }
    else {
        console.log("project_progress table already exists");
        await addColumnIfMissing("project_progress", "fileName", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        });
        await addColumnIfMissing("project_progress", "fileUrl", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        });
        await addColumnIfMissing("project_progress", "fileMimeType", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        });
        await addColumnIfMissing("project_progress", "fileSize", {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        });
    }
    process.exit(0);
}
syncProjectPhaseSchema().catch((error) => {
    console.error(error);
    process.exit(1);
});
