"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProjectController = exports.manuallyAssignGuideToProjectController = exports.getAdminOverviewController = exports.getMyProjectsController = exports.getGuideProjectsController = exports.getStudentsController = exports.getActiveGuidesController = exports.submitProjectController = void 0;
const project_dto_1 = require("./project.dto");
const project_service_1 = require("./project.service");
const project_service_2 = require("./project.service");
const submitProjectController = async (req, res) => {
    try {
        const studentId = req.user.id;
        const validatedData = project_dto_1.createProjectSchema.parse(req.body);
        const project = await (0, project_service_2.createProjectService)(studentId, validatedData);
        res.status(201).json({
            success: true,
            message: "Project submitted successfully",
            data: project,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.submitProjectController = submitProjectController;
const getActiveGuidesController = async (_req, res) => {
    try {
        const guides = await (0, project_service_2.getActiveGuidesService)();
        res.json({ success: true, data: guides });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getActiveGuidesController = getActiveGuidesController;
const getStudentsController = async (req, res) => {
    try {
        const studentId = req.user.id;
        const students = await (0, project_service_2.getStudentsService)(studentId);
        res.json({ success: true, data: students });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getStudentsController = getStudentsController;
const getGuideProjectsController = async (req, res) => {
    try {
        const projects = await (0, project_service_2.getGuideProjectsService)(req.user);
        res.json({ success: true, data: projects });
    }
    catch (error) {
        res.status(error.message?.includes("not found") ? 404 : 500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getGuideProjectsController = getGuideProjectsController;
const getMyProjectsController = async (req, res) => {
    try {
        const studentId = req.user.id;
        const projects = await (0, project_service_1.getMyProjectsService)(studentId);
        res.json({ success: true, data: projects });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyProjectsController = getMyProjectsController;
const getAdminOverviewController = async (_req, res) => {
    try {
        const overview = await (0, project_service_2.getAdminOverviewService)();
        res.json({ success: true, data: overview });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAdminOverviewController = getAdminOverviewController;
const manuallyAssignGuideToProjectController = async (req, res) => {
    try {
        const projectId = Number(req.params.projectId);
        const { guideId } = project_dto_1.manualAssignGuideSchema.parse(req.body);
        const project = await (0, project_service_2.manuallyAssignGuideToProjectService)(projectId, guideId);
        res.json({
            success: true,
            message: "Guide assigned successfully.",
            data: project,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.manuallyAssignGuideToProjectController = manuallyAssignGuideToProjectController;
const deleteProjectController = async (req, res) => {
    try {
        const projectId = Number(req.params.projectId);
        const result = await (0, project_service_2.deleteProjectService)(projectId, req.user);
        res.json({
            success: true,
            message: "Project deleted successfully.",
            data: result,
        });
    }
    catch (error) {
        const status = error.message?.includes("not found") ? 404 : error.message?.includes("allowed") || error.message?.includes("only projects assigned") ? 403 : 400;
        res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};
exports.deleteProjectController = deleteProjectController;
