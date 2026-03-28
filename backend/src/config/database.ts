// src/config/database.ts
import dotenv from "dotenv";

dotenv.config();
import { Sequelize } from "sequelize";

const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const useSsl = process.env.DB_SSL === "true";

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: process.env.DB_HOST,
    port: dbPort,
    dialect: "mysql",
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : undefined,
    logging: false,
  }
);
