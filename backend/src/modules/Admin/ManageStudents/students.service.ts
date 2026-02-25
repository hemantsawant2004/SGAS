import { User } from "../../user/user.models";


//get students
export const getAllStudents = async ()=>{
    const students = await User.findAll({
        attributes:[
            "id",
            "username",
            "role",
        ],
        where: {role:"student"}
    });
    return students;
};

//update
export const updateStudent = async (id:number, updateData:{
    username?:string; given_name?:string;
})=>{
    const student = await User.findOne({
        where:{id, role:"student"},
    });

    if(!student){
        throw new Error("student not found");
    }

    await student.update(updateData);
    return student;
};

//delete
export const deleteStudent = async (id:number)=>{
    const student = await User.findOne({
        where:{id, role:"student"},
    });
    if(!student){
        throw new Error("student not found");
    }

    await student.destroy();

    return {message:"student deleted successfully"};
};