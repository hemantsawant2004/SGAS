import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/requireRole";
import {
  createProjectProgressController,
  deleteProjectProgressController,
  submitProjectController,
  getActiveGuidesController,
  getStudentsController,
  getGuideProjectsController,
  getMyProjectsController,
  getAdminOverviewController,
  getProjectProgressController,
  getProjectTrackingByCodeController,
  manuallyAssignGuideToProjectController,
  deleteProjectController,
  reviewProjectProgressController,
} from "./project.controller";

const projectRoutes = Router();

projectRoutes.use(requireAuth);

projectRoutes.post("/", requireRole(["student"]), submitProjectController);//for students to creatr or submit the project
projectRoutes.get("/guides", requireRole(["student"]), getActiveGuidesController);//to get all active guides to select in preferred guide 
projectRoutes.get("/students", requireRole(["student"]), getStudentsController);//to get all students list while submitting project and to create grp members
projectRoutes.get("/my-projects", requireRole(["student"]), getMyProjectsController);//student can see their submitted projects
projectRoutes.get("/guide-projects", requireRole(["guide"]), getGuideProjectsController);//for guide to see allocated projects to them
projectRoutes.get("/admin-overview", requireRole(["admin"]), getAdminOverviewController);//admin can monitor all project activity
projectRoutes.get("/track/:projectCode", requireRole(["student", "guide", "admin"]), getProjectTrackingByCodeController);
projectRoutes.get("/:projectId/progress", requireRole(["student", "guide", "admin"]), getProjectProgressController);
projectRoutes.post("/:projectId/progress", requireRole(["student"]), createProjectProgressController);
projectRoutes.delete("/progress/:progressId", requireRole(["student"]), deleteProjectProgressController);
projectRoutes.patch("/progress/:progressId/review", requireRole(["guide"]), reviewProjectProgressController);
projectRoutes.patch(
  "/:projectId/assign-guide",
  requireRole(["admin"]),
  manuallyAssignGuideToProjectController
);
projectRoutes.delete(
  "/:projectId",
  requireRole(["admin", "guide"]),
  deleteProjectController
);

export default projectRoutes;
