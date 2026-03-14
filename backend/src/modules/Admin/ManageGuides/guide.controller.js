"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateGuide = exports.deactivateGuide = exports.removeGuide = exports.setAllGuidesMaxProjects = exports.setGuideMaxProjects = exports.getGuides = void 0;
const guide_service_1 = require("./guide.service");
const guide_service_2 = require("./guide.service");
const guide_service_3 = require("./guide.service");
const getGuides = async (req, res) => {
    const guides = await (0, guide_service_1.getAllGuides)();
    res.status(200).json({
        success: true,
        data: guides,
    });
};
exports.getGuides = getGuides;
//set maxprojects for every guide saparately
const setGuideMaxProjects = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { maxProjects } = req.body;
        if (!maxProjects && maxProjects !== 0) {
            return res.status(400).json({
                success: false,
                message: "max projects is required",
            });
        }
        const parsedMax = Number(maxProjects);
        if (!Number.isInteger(parsedMax) || parsedMax <= 0) {
            return res.status(400).json({
                success: false,
                message: "max  projects must be a positive integer",
            });
        }
        const updatedGuide = await (0, guide_service_1.updateGuideMaxProjects)(id, parsedMax);
        res.status(200).json({
            success: true,
            message: "max project limit updated successfully",
            data: updatedGuide,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message || "failed to update max projects limit ",
        });
    }
};
exports.setGuideMaxProjects = setGuideMaxProjects;
//set maxprojects for every guide at once
const setAllGuidesMaxProjects = async (req, res) => {
    try {
        const { maxProjects } = req.body;
        if (maxProjects === undefined || maxProjects === null) {
            return res.status(400).json({
                success: false,
                message: "max projects is required",
            });
        }
        const parsedMax = Number(maxProjects);
        if (!Number.isInteger(parsedMax) || parsedMax <= 0) {
            return res.status(400).json({
                success: false,
                message: "max projects must be positive",
            });
        }
        const result = await (0, guide_service_1.updateAllGuidesMaxProjects)(parsedMax);
        res.status(200).json({
            success: true,
            message: "Max projects limit applied to all guides",
            updatedCount: result.updatedCount,
            maxProjects: parsedMax,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Failed to update max project limit to all guides",
        });
    }
};
exports.setAllGuidesMaxProjects = setAllGuidesMaxProjects;
//delete guide
const removeGuide = async (req, res) => {
    const id = Number(req.params.id);
    const result = await (0, guide_service_1.deleteGuides)(id);
    res.sendStatus(200).json({
        success: true,
        message: result.message,
    });
};
exports.removeGuide = removeGuide;
const deactivateGuide = async (req, res) => {
    const id = Number(req.params.id);
    const result = await (0, guide_service_2.softDeleteGuide)(id);
    res.status(200).json({
        success: true,
        message: result.message,
    });
};
exports.deactivateGuide = deactivateGuide;
const activateGuide = async (req, res) => {
    const id = Number(req.params.id);
    const result = await (0, guide_service_3.reactivateGuide)(id);
    res.status(200).json({
        success: true,
        message: result.message,
    });
};
exports.activateGuide = activateGuide;
