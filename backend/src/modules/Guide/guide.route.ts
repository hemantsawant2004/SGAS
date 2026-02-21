import { Router } from "express";
import { auth, checkGuide } from "../../core/auth";
import {
  createGuide,
  getMyGuideProfile,
  updateMyGuideProfile,
} from "./guide.controller";

const guideRouter = Router();

guideRouter.post("/profile", auth(), checkGuide, createGuide);
guideRouter.get("/profile/me", auth(), checkGuide, getMyGuideProfile);
guideRouter.patch("/profile/me", auth(), checkGuide, updateMyGuideProfile);

export default guideRouter;
