import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/requireRole";
import {
  submitProjectController,
  getActiveGuidesController,
  getStudentsController,
  getGuideProjectsController,
  getMyProjectsController,
} from "./project.controller";

const projectRoutes = Router();

projectRoutes.use(requireAuth);

projectRoutes.post("/", requireRole(["student"]), submitProjectController);//for students to creatr or submit the project
projectRoutes.get("/guides", requireRole(["student"]), getActiveGuidesController);//to get all active guides to select in preferred guide 
projectRoutes.get("/students", requireRole(["student"]), getStudentsController);//to get all students list while submitting project and to create grp members
projectRoutes.get("/my-projects", requireRole(["student"]), getMyProjectsController);//student can see their submitted projects
projectRoutes.get("/guide-projects", requireRole(["guide"]), getGuideProjectsController);//for guide to see allocated projects to them

export default projectRoutes;
