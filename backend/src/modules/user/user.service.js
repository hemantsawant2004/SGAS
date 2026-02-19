"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByUsername = findUserByUsername;
exports.findUserById = findUserById;
exports.updateRefreshToken = updateRefreshToken;
exports.createPreUser = createPreUser;
exports.updateUserPassword = updateUserPassword;
const user_models_1 = require("./user.models");
async function findUserByUsername(username) {
    console.log("inside find user by username", username);
    return user_models_1.User.findOne({
        where: { username },
    });
}
async function findUserById(id) {
    return user_models_1.User.findByPk(id);
}
async function updateRefreshToken(userId, refresh_token_hash, refresh_token_expires_at) {
    console.log("inside clear refresh token", refresh_token_hash);
    console.log("userid", userId);
    console.log("refresh_token_expires_at", refresh_token_expires_at);
    return user_models_1.User.update({ refresh_token_hash, refresh_token_expires_at }, { where: { id: userId } });
}
/**
 * Create pre-registered user (without password)
 * Roles allowed: admin | guide | student
 */
async function createPreUser(data) {
    return user_models_1.User.create({
        ...data,
        password: null,
    });
}
async function updateUserPassword(userId, password) {
    return user_models_1.User.update({ password }, { where: { id: userId } });
}
