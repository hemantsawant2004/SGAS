"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGuides = exports.reactivateGuide = exports.softDeleteGuide = exports.updateAllGuidesMaxProjects = exports.updateGuideMaxProjects = exports.getAllGuides = void 0;
const guide_model_1 = require("../../Guide/guide.model");
//get
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
            "maxProjects",
            "username",
            "createdAt",
        ],
        //  where: { isActive: true }
    });
    return guides;
};
exports.getAllGuides = getAllGuides;
//admin sets max projects limits for every guide
const updateGuideMaxProjects = async (id, maxProjects) => {
    if (!Number.isInteger(maxProjects) || maxProjects <= 0) {
        throw new Error("max projects must be a positive integer");
    }
    const guide = await guide_model_1.Guide.findByPk(id);
    if (!guide) {
        throw new Error("Guide not found");
    }
    // OPTIONAL: if you want to prevent setting less than already assigned
    // const currentAssignedCount = await Project.count({ where: { guideId: id } });
    // if (maxProjects < currentAssignedCount) {
    //   throw new Error(
    //     `Cannot set limit less than current assigned projects (${currentAssignedCount})`
    //   );
    // }
    guide.maxProjects = maxProjects;
    await guide.save();
    return guide;
};
exports.updateGuideMaxProjects = updateGuideMaxProjects;
//apply limit to all guides at once no saparately
const updateAllGuidesMaxProjects = async (maxProjects) => {
    if (!Number.isInteger(maxProjects) || maxProjects <= 0) {
        throw new Error("max projects must be greater than 0");
    }
    const [affectedRows] = await guide_model_1.Guide.update({ maxProjects }, {
        where: { isActive: true }, //for only active guides update
        //where: {} for all guides update
    });
    return {
        updatedCount: affectedRows,
    };
};
exports.updateAllGuidesMaxProjects = updateAllGuidesMaxProjects;
//deactivate guide
const softDeleteGuide = async (id) => {
    const [updated] = await guide_model_1.Guide.update({ isActive: false }, { where: { id } });
    if (!updated) {
        throw new Error("Guide not found");
    }
    return { message: "Guide deactivated successfully" };
};
exports.softDeleteGuide = softDeleteGuide;
//reactivate guide
const reactivateGuide = async (id) => {
    const [updated] = await guide_model_1.Guide.update({ isActive: true }, { where: { id } });
    if (!updated) {
        throw new Error("Guide not found");
    }
    return { message: "Guide reactivated successfully" };
};
exports.reactivateGuide = reactivateGuide;
//delete guide
const deleteGuides = async (id) => {
    const guides = await guide_model_1.Guide.findOne({
        where: { id },
    });
    if (!guides) {
        throw new Error("guide not found");
    }
    await guides.destroy();
    return { message: "guide deleted successfully" };
};
exports.deleteGuides = deleteGuides;
