import { Guide } from "../../Guide/guide.model";

//get all guides
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
     where: { isActive: true }
  });
  return guides;
};
