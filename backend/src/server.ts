import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { sequelize } from "./config/database";
import "./modules";
import { syncNotificationTable } from "./modules/notifications/notification.service";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  try {
    await sequelize.authenticate();
    await syncNotificationTable();
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
