"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
// import { applyAssociations } from "./associations";
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
async function start() {
    try {
        await database_1.sequelize.authenticate();
        // await sequelize.sync(); // consider { alter: true } in dev only
        //  sequelize.sync()
        await database_1.sequelize.sync({ alter: true })
            .then(() => {
            console.log("Database synced");
        })
            .catch(err => {
            console.error("Error syncing database:", err);
        });
        app_1.default.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}
start();
