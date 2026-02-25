import { Request, Response } from "express";
import { getAllGuides } from "./guides.service";

export const getallGuides = async (req:Request, res:Response)=>{
    const guides = await getAllGuides();

    res.status(200).json({
        success: true,
        data:guides,
    });
};