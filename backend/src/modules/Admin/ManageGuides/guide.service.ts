import { Guide } from "../../Guide/guide.model";


//get
export const getAllGuides = async () => {
  const guides = await Guide.findAll({
    attributes: [
      "id",
      "fullname",
      "email",
      "phone",
      "linkedin",
      "bio",
      "departmentName",
      "qualification",
      "experience",
      "expertise",
      "isActive",
      "username",
      "createdAt",
    ],
    //  where: { isActive: true }
  });
  return guides;
};

//deactivate guide
export const softDeleteGuide = async (id: number) => {
  const [updated] = await Guide.update(
    { isActive: false },
    { where: { id } }
  );

  if (!updated) {
    throw new Error("Guide not found");
  }

  return { message: "Guide deactivated successfully" };
};


//reactivate guide
export const reactivateGuide = async (id: number) => {
  const [updated] = await Guide.update(
    { isActive: true },
    { where: { id } }
  );

  if (!updated) {
    throw new Error("Guide not found");
  }

  return { message: "Guide reactivated successfully" };
};

//delete guide
export const deleteGuides = async(id:number)=>{
  const guides=await Guide.findOne({
    where:{id},
  });

  if(!guides){
    throw new Error("guide not found");
  }

  await guides.destroy();
  return{message:"guide deleted successfully"};
};

