import { Sequelize } from "sequelize";

const isSslEnabled =
  process.env.DB_SSL === "true" ||
  process.env.DB_SSL === "1" ||
  process.env.MYSQL_SSL === "true" ||
  process.env.MYSQL_SSL === "1";

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
    dialectOptions: isSslEnabled
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
          connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 60000),
        }
      : {
          connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 60000),
        },
  }
);
