import { Router } from "express";
import { activateGuide, getGuides, removeGuide, setAllGuidesMaxProjects, setGuideMaxProjects } from "./guide.controller";
import { deactivateGuide } from "./guide.controller";

const AdminGuideRoutes = Router();

AdminGuideRoutes.get("/", getGuides);
AdminGuideRoutes.patch("/:id/deactivate", deactivateGuide);
AdminGuideRoutes.patch("/:id/reactivate", activateGuide)
AdminGuideRoutes.delete("/:id/delete",removeGuide);
AdminGuideRoutes.patch("/:id/max-projects", setGuideMaxProjects);//to specific guide
AdminGuideRoutes.patch("/max-projects", setAllGuidesMaxProjects);//to all guides at a time

export default AdminGuideRoutes;