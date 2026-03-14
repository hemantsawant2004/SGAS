"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllGuides = void 0;
const guide_model_1 = require("../../Guide/guide.model");
//get all guides
const getAllGuides = async () => {
    const guides = await guide_model_1.Guide.findAll({
        attributes: [
            "id",
            "fullname",
            "email",
            "phone",
            "linkedin",
            "bio",
            "departmentName",
            "qualification",
            "experience",
            "expertise",
            "isActive",
            "username",
            "createdAt",
        ],
        where: { isActive: true }
    });
    return guides;
};
exports.getAllGuides = getAllGuides;
