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
      "maxProjects",
      "username",
      "createdAt",
    ],
    //  where: { isActive: true }
  });
  return guides;
};

//admin sets max projects limits for every guide
export const updateGuideMaxProjects = async (
  id:number,
  maxProjects:number
) => {
  if(!Number.isInteger(maxProjects) || maxProjects <= 0 ) {
    throw new Error("max projects must be a positive integer");
  }

  const guide = await Guide.findByPk(id);

  if(!guide){
    throw new Error("Guide not found");
  }

  // OPTIONAL: if you want to prevent setting less than already assigned
  // const currentAssignedCount = await Project.count({ where: { guideId: id } });
  // if (maxProjects < currentAssignedCount) {
  //   throw new Error(
  //     `Cannot set limit less than current assigned projects (${currentAssignedCount})`
  //   );
  // }

    guide.maxProjects = maxProjects;
    await guide.save();

    return guide;
}

//apply limit to all guides at once no saparately
export const updateAllGuidesMaxProjects = async (maxProjects:number) => {
  if(!Number.isInteger(maxProjects) || maxProjects <= 0){
    throw new Error("max projects must be greater than 0");
  }

  const [affectedRows] = await Guide.update(
    {maxProjects},
    {
      where: { isActive: true},//for only active guides update
      //where: {} for all guides update
    }
  );
  return{
    updatedCount: affectedRows,
  };
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

