import { Request, Response } from "express";
import { createProjectSchema, manualAssignGuideSchema } from "./project.dto";
import { getMyProjectsService } from "./project.service";
import {
  createProjectService,
  deleteProjectService,
  getActiveGuidesService,
  getAdminOverviewService,
  getStudentsService,
  getGuideProjectsService,
  manuallyAssignGuideToProjectService,
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
    const projects = await getGuideProjectsService(req.user!);

    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(error.message?.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message,
    });
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

export const getAdminOverviewController = async (_req: Request, res: Response) => {
  try {
    const overview = await getAdminOverviewService();
    res.json({ success: true, data: overview });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const manuallyAssignGuideToProjectController = async (
  req: Request,
  res: Response
) => {
  try {
    const projectId = Number(req.params.projectId);
    const { guideId } = manualAssignGuideSchema.parse(req.body);

    const project = await manuallyAssignGuideToProjectService(projectId, guideId);

    res.json({
      success: true,
      message: "Guide assigned successfully.",
      data: project,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProjectController = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);

    const result = await deleteProjectService(projectId, req.user!);

    res.json({
      success: true,
      message: "Project deleted successfully.",
      data: result,
    });
  } catch (error: any) {
    const status =
      error.message?.includes("not found") ? 404 : error.message?.includes("allowed") || error.message?.includes("only projects assigned") ? 403 : 400;

    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};
