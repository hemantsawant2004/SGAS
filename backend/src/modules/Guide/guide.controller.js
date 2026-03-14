"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyGuideProfile = exports.getMyGuideProfile = exports.createGuide = void 0;
const guide_dto_1 = require("./guide.dto");
const guide_service_1 = require("./guide.service");
const createGuide = async (req, res) => {
    try {
        if (!req.user?.username) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const validatedData = guide_dto_1.createGuideSchema.parse(req.body);
        const guide = await (0, guide_service_1.CreateGuideProfile)(validatedData, req.user);
        res.status(201).json({
            message: "Guide profile created successfully",
            data: guide,
        });
    }
    catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};
exports.createGuide = createGuide;
const getMyGuideProfile = async (req, res) => {
    if (!req.user?.username) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const guide = await (0, guide_service_1.getGuideProfileByUser)(req.user);
    if (!guide) {
        return res.status(404).json({ message: "Guide profile not found" });
    }
    return res.status(200).json({ data: guide });
};
exports.getMyGuideProfile = getMyGuideProfile;
const updateMyGuideProfile = async (req, res) => {
    try {
        if (!req.user?.username) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const validatedData = guide_dto_1.createGuideSchema.parse(req.body);
        const updatedGuide = await (0, guide_service_1.updateGuideProfileByUser)(req.user, validatedData);
        if (!updatedGuide) {
            return res.status(404).json({ message: "Guide profile not found" });
        }
        return res.status(200).json({
            message: "Guide profile updated successfully",
            data: updatedGuide,
        });
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
exports.updateMyGuideProfile = updateMyGuideProfile;
