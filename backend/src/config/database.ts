// src/config/database.ts
import dotenv from "dotenv";

dotenv.config();
import { Sequelize } from "sequelize";

console.log("all the db values",{
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS ,
  DB_HOST: process.env.DB_HOST,
});
export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);
