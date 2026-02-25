import { Router } from "express";
import { getallGuides } from "./guides.controller";

const StudentGuideRoutes = Router();

StudentGuideRoutes.get("/", getallGuides);

export default StudentGuideRoutes;