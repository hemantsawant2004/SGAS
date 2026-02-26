import { Request, Response } from "express";
import { createProjectSchema } from "./project.dto";
import { getMyProjectsService } from "./project.service";
import {
  createProjectService,
  getActiveGuidesService,
  getStudentsService,
  getGuideProjectsService,
} from "./project.service";

export const submitProjectController = async (
  req: Request,
  res: Response
) => {
  try {
    const studentId = (req as any).user.id;

    const validatedData = createProjectSchema.parse(req.body);

    const project = await createProjectService(
      studentId,
      validatedData
    );

    res.status(201).json({
      success: true,
      message: "Project submitted successfully",
      data: project,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActiveGuidesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const guides = await getActiveGuidesService();
    res.json({ success: true, data: guides });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const studentId = (req as any).user.id;
    const students = await getStudentsService(studentId);
    res.json({ success: true, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGuideProjectsController = async (
  req: Request,
  res: Response
) => {
  try {
    const guideId = (req as any).user.id;
    const projects = await getGuideProjectsService(guideId);

    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getMyProjectsController = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.id;
    const projects = await getMyProjectsService(studentId);
    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
