"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuideProjectsService = exports.updateGuideProfileByUser = exports.getGuideProfileByUser = exports.CreateGuideProfile = void 0;
const guide_model_1 = require("./guide.model");
const project_model_1 = require("../projects/project.model");
const CreateGuideProfile = async (data, user) => {
    const existingByUser = await guide_model_1.Guide.findOne({ where: { userId: user.id } });
    if (existingByUser) {
        throw new Error("Guide profile already exists for this user");
    }
    const existingByEmail = await guide_model_1.Guide.findOne({ where: { email: data.email } });
    if (existingByEmail) {
        throw new Error("Guide already exists with this email");
    }
    return await guide_model_1.Guide.create({ ...data, userId: user.id, username: user.username });
};
exports.CreateGuideProfile = CreateGuideProfile;
const getGuideProfileByUser = async (user) => {
    const byUserId = await guide_model_1.Guide.findOne({ where: { userId: user.id } });
    if (byUserId)
        return byUserId;
    const byUsername = await guide_model_1.Guide.findOne({ where: { username: user.username } });
    if (byUsername) {
        await byUsername.update({ userId: user.id });
        return byUsername;
    }
    return null;
};
exports.getGuideProfileByUser = getGuideProfileByUser;
const updateGuideProfileByUser = async (user, data) => {
    const guide = await (0, exports.getGuideProfileByUser)(user);
    if (!guide)
        return null;
    const existingByEmail = await guide_model_1.Guide.findOne({ where: { email: data.email } });
    if (existingByEmail && existingByEmail.get("id") !== guide.get("id")) {
        throw new Error("Guide already exists with this email");
    }
    await guide.update({ ...data, userId: user.id, username: user.username });
    return guide;
};
exports.updateGuideProfileByUser = updateGuideProfileByUser;
const getGuideProjectsService = async (studentId) => {
    return project_model_1.Project.findAll({
        where: { studentId },
        include: [
            { association: "preferredGuide", attributes: ["id", "fullName"] },
            { association: "members", attributes: ["id", "username"], through: { attributes: [] } },
        ],
        order: [["createdAt", "DESC"]],
    });
};
exports.getGuideProjectsService = getGuideProjectsService;
