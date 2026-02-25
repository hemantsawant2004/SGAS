import { Request, Response } from "express";
import { getAllStudents, updateStudent, deleteStudent } from "./students.service";


//get students
export const getStudents = async (req:Request, res:Response)=>{
    const students = await getAllStudents();

    res.status(200).json({
        success:true,
        data:students,
    });
};

//update student
export const updateStudents = async (req:Request, res:Response)=>{
    try{
        const {id}=req.params;
        const updateData = req.body;

        const updatedStudent = await updateStudent(Number(id),updateData);

        res.status(200).json({
            success:true,
            data:updatedStudent,
        });
    }catch(err:any){
        res.status(400).json({success:false, message:err.message});
    }
};

export const deleteStudents = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await deleteStudent(Number(id));

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

