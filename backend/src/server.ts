import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { sequelize } from "./config/database";
// import { applyAssociations } from "./associations";
import { Guide } from "./modules/Guide/guide.model";


const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  try {
    await sequelize.authenticate();
   // await sequelize.sync(); // consider { alter: true } in dev only


  //  sequelize.sync()
   await sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database synced");
  })
  .catch(err => {
    console.error("Error syncing database:", err);
  });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
