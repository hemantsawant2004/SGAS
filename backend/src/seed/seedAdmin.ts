import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { sequelize } from "../config/database";
import { User } from "../modules/user/user.models";

async function seedAdmin() {
  await sequelize.authenticate();
  await User.sync();

  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASS || "123456";
  const givenName = process.env.SEED_ADMIN_NAME || "Admin";

  const hashedPassword = await bcrypt.hash(password, 10);

  const [admin, created] = await User.findOrCreate({
    where: { username },
    defaults: {
      username,
      password: hashedPassword,
      given_name: givenName,
      role: "admin",
    },
  });

  if (!created) {
    await admin.update({
      password: hashedPassword,
      given_name: givenName,
      role: "admin",
    });
  }

  console.log(`Admin user ${created ? "created" : "updated"} successfully.`);
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
