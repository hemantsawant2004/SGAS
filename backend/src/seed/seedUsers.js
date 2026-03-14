"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = require("../config/database");
const user_models_1 = require("../modules/user/user.models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seedUsers() {
    await database_1.sequelize.authenticate();
    await database_1.sequelize.sync({ alter: true });
    const adminPassword = process.env.SEED_ADMIN_PASS || "123456";
    const guidePassword = process.env.SEED_GUIDE_PASS || "123456";
    const studentPassword = process.env.SEED_STUDENT_PASS || "123456";
    const adminHashed = await bcryptjs_1.default.hash(adminPassword, 10);
    const guideHashed = await bcryptjs_1.default.hash(guidePassword, 10);
    const studentHashed = await bcryptjs_1.default.hash(studentPassword, 10);
    // ✅ Admin
    await user_models_1.User.findOrCreate({
        where: { username: "admin" },
        defaults: {
            username: "admin",
            password: adminHashed,
            given_name: "Admin",
            role: "admin",
        },
    });
    // ✅ Guide
    await user_models_1.User.findOrCreate({
        where: { username: "guide" },
        defaults: {
            username: "guide",
            password: guideHashed,
            given_name: "Guide User",
            role: "guide",
        },
    });
    // ✅ Student
    await user_models_1.User.findOrCreate({
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
