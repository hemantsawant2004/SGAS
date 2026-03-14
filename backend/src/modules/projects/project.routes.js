"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const requireRole_1 = require("../../middlewares/requireRole");
const project_controller_1 = require("./project.controller");
const projectRoutes = (0, express_1.Router)();
projectRoutes.use(auth_1.requireAuth);
projectRoutes.post("/", (0, requireRole_1.requireRole)(["student"]), project_controller_1.submitProjectController); //for students to creatr or submit the project
projectRoutes.get("/guides", (0, requireRole_1.requireRole)(["student"]), project_controller_1.getActiveGuidesController); //to get all active guides to select in preferred guide 
projectRoutes.get("/students", (0, requireRole_1.requireRole)(["student"]), project_controller_1.getStudentsController); //to get all students list while submitting project and to create grp members
projectRoutes.get("/my-projects", (0, requireRole_1.requireRole)(["student"]), project_controller_1.getMyProjectsController); //student can see their submitted projects
projectRoutes.get("/guide-projects", (0, requireRole_1.requireRole)(["guide"]), project_controller_1.getGuideProjectsController); //for guide to see allocated projects to them
projectRoutes.get("/admin-overview", (0, requireRole_1.requireRole)(["admin"]), project_controller_1.getAdminOverviewController); //admin can monitor all project activity
projectRoutes.patch("/:projectId/assign-guide", (0, requireRole_1.requireRole)(["admin"]), project_controller_1.manuallyAssignGuideToProjectController);
projectRoutes.delete("/:projectId", (0, requireRole_1.requireRole)(["admin", "guide"]), project_controller_1.deleteProjectController);
exports.default = projectRoutes;
