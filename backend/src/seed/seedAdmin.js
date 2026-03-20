"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const user_models_1 = require("../modules/user/user.models");
async function seedAdmin() {
    await database_1.sequelize.authenticate();
    await user_models_1.User.sync();
    const username = process.env.SEED_ADMIN_USERNAME || "admin";
    const password = process.env.SEED_ADMIN_PASS || "123456";
    const givenName = process.env.SEED_ADMIN_NAME || "Admin";
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const [admin, created] = await user_models_1.User.findOrCreate({
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
