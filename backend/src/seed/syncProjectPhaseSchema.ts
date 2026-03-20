import dotenv from "dotenv";
dotenv.config();

import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

const DEFAULT_PHASE_STATUSES = JSON.stringify([
  { phase: "intro", status: "pending" },
  { phase: "system analysis", status: "pending" },
  { phase: "system design", status: "pending" },
  { phase: "reports", status: "pending" },
  { phase: "rough documentation", status: "pending" },
  { phase: "final submission", status: "pending" },
]);

async function addColumnIfMissing(tableName: string, columnName: string, definition: object) {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable(tableName);

  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition as any);
    console.log(`Added ${tableName}.${columnName}`);
    return;
  }

  console.log(`${tableName}.${columnName} already exists`);
}

async function syncProjectPhaseSchema() {
  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();

  const projectsTable = await queryInterface.describeTable("projects");

  if (!projectsTable.phaseStatuses) {
    await queryInterface.addColumn("projects", "phaseStatuses", {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: JSON.parse(DEFAULT_PHASE_STATUSES),
    });
    console.log("Added projects.phaseStatuses");
  } else {
    console.log("projects.phaseStatuses already exists");
  }

  const allTables = await queryInterface.showAllTables();
  const normalizedTables = allTables.map((table) =>
    typeof table === "string" ? table : String((table as any).tableName ?? table)
  );

  if (!normalizedTables.includes("project_progress")) {
    await queryInterface.createTable("project_progress", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "projects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      phase: {
        type: DataTypes.ENUM(
          "intro",
          "system analysis",
          "system design",
          "reports",
          "rough documentation",
          "final submission"
        ),
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
        type: DataTypes.ENUM("pending", "needs_changes", "completed"),
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
    console.log("Created project_progress table");
  } else {
    console.log("project_progress table already exists");
    await addColumnIfMissing("project_progress", "fileName", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    });
    await addColumnIfMissing("project_progress", "fileUrl", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    });
    await addColumnIfMissing("project_progress", "fileMimeType", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    });
    await addColumnIfMissing("project_progress", "fileSize", {
      type: DataTypes.INTEGER,
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
