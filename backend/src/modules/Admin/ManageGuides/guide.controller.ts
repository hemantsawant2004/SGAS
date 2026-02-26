import { Request, Response } from "express";
import { deleteGuides, getAllGuides } from "./guide.service";
import { softDeleteGuide } from "./guide.service";
import { reactivateGuide } from "./guide.service";

export const getGuides = async (req: Request, res: Response) => {
  const guides = await getAllGuides();

  res.status(200).json({
    success: true,
    data: guides,
  });
};

//delete guide
export const removeGuide = async(req:Request, res:Response)=>{
  const id =  Number(req.params.id);

  const result = await deleteGuides (id);

  res.sendStatus(200).json({
    success:true,
    message:result.message,
  });
};


export const deactivateGuide = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await softDeleteGuide(id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

export const activateGuide = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await reactivateGuide(id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};