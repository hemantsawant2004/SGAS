import dotenv from "dotenv";
dotenv.config();
import { sequelize } from "../config/database";
import { User } from "../modules/user/user.models";
import bcrypt from "bcryptjs";

async function seedUsers() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const adminPassword = process.env.SEED_ADMIN_PASS || "123456";
  const guidePassword = process.env.SEED_GUIDE_PASS || "123456";
  const studentPassword = process.env.SEED_STUDENT_PASS || "123456";

  const adminHashed = await bcrypt.hash(adminPassword, 10);
  const guideHashed = await bcrypt.hash(guidePassword, 10);
  const studentHashed = await bcrypt.hash(studentPassword, 10);

  // ✅ Admin
  await User.findOrCreate({
    where: { username: "admin" },
    defaults: {
      username: "admin",
      password: adminHashed,
      given_name: "Admin",
      role: "admin",
    },
  });

  // ✅ Guide
  await User.findOrCreate({
    where: { username: "guide" },
    defaults: {
      username: "guide",
      password: guideHashed,
      given_name: "Guide User",
      role: "guide",
    },
  });

  // ✅ Student
  await User.findOrCreate({
    where: { username: "student" },
    defaults: {
      username: "student",
      password: studentHashed,
      given_name: "Student User",
      role: "student",
    },
  });

  console.log("Seed users created/verified successfully ✅");
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
