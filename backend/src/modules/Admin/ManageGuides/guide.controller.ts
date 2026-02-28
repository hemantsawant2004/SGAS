import { Request, Response } from "express";
import { deleteGuides, getAllGuides, updateGuideMaxProjects, updateAllGuidesMaxProjects } from "./guide.service";
import { softDeleteGuide } from "./guide.service";
import { reactivateGuide } from "./guide.service";

export const getGuides = async (req: Request, res: Response) => {
  const guides = await getAllGuides();

  res.status(200).json({
    success: true,
    data: guides,
  });
};



//set maxprojects for every guide saparately
export const setGuideMaxProjects = async (req:Request, res:Response) => {
  try {
    const id = Number(req.params.id);
    const {maxProjects} = req.body;

    if(!maxProjects && maxProjects !== 0 ){
      return res.status(400).json({
        success : false,
        message: "max projects is required",
      });
    }

    const parsedMax = Number(maxProjects);

    if (!Number.isInteger(parsedMax) || parsedMax <= 0 ){
      return res.status(400).json({
        success: false,
        message: "max  projects must be a positive integer",
      });
    }
      const updatedGuide = await updateGuideMaxProjects(id, parsedMax);

      res.status(200).json({
        success:true,
        message: "max project limit updated successfully",
        data: updatedGuide,
      });
   
  }catch (err:any){
      res.status(400).json({
        success: false,
        message: err.message || "failed to update max projects limit ",
      });
    }
};

//set maxprojects for every guide at once
export const setAllGuidesMaxProjects = async (req:Request, res:Response)=>{
  try{
    const {maxProjects} = req.body;

    if (maxProjects === undefined || maxProjects === null){
      return res.status(400).json({
        success: false,
        message: "max projects is required",
      });
    }

    const parsedMax = Number(maxProjects);

    if (!Number.isInteger(parsedMax) || parsedMax <= 0){
      return res.status(400).json({
        success: false,
        message: "max projects must be positive",
      });
    }
    const result = await updateAllGuidesMaxProjects(parsedMax);

    res.status(200).json({
      success: true,
      message: "Max projects limit applied to all guides",
      updatedCount: result.updatedCount,
      maxProjects: parsedMax,
    });
  }catch (err: any){
    res.status(500).json({
      success: false,
      message: err.message || "Failed to update max project limit to all guides",
    });
  }
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