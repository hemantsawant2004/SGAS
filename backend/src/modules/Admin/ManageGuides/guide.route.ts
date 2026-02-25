import { Router } from "express";
import { activateGuide, getGuides } from "./guide.controller";
import { deactivateGuide } from "./guide.controller";

const AdminGuideRoutes = Router();

AdminGuideRoutes.get("/", getGuides);
AdminGuideRoutes.patch("/:id/deactivate", deactivateGuide);
AdminGuideRoutes.patch("/:id/reactivate", activateGuide)
export default AdminGuideRoutes;