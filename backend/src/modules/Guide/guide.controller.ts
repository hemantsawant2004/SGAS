import { Request, Response } from "express";
import { createGuideSchema } from "./guide.dto";
import {
  CreateGuideProfile,
  getGuideProfileByUser,
  updateGuideProfileByUser,
} from "./guide.service";

export const createGuide = async (req: Request, res: Response) => {
  try {
    if (!req.user?.username) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = createGuideSchema.parse(req.body);

    const guide = await CreateGuideProfile(validatedData, req.user);

    res.status(201).json({
      message: "Guide profile created successfully",
      data: guide,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getMyGuideProfile = async (req: Request, res: Response) => {
  if (!req.user?.username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const guide = await getGuideProfileByUser(req.user);
  if (!guide) {
    return res.status(404).json({ message: "Guide profile not found" });
  }

  return res.status(200).json({ data: guide });
};

export const updateMyGuideProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.username) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = createGuideSchema.parse(req.body);
    const updatedGuide = await updateGuideProfileByUser(req.user, validatedData);

    if (!updatedGuide) {
      return res.status(404).json({ message: "Guide profile not found" });
    }

    return res.status(200).json({
      message: "Guide profile updated successfully",
      data: updatedGuide,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
