import { Router } from "express";
// import { activateGuide, getGuides } from "./guide.controller";
// import { deactivateGuide } from "./guide.controller";
import { deleteStudents, getStudents, updateStudents } from "./students.controller";

const AdminStudentRoutes = Router();

AdminStudentRoutes.get("/", getStudents);
AdminStudentRoutes.patch("/:id/", updateStudents);
AdminStudentRoutes.delete("/:id/", deleteStudents);



export default AdminStudentRoutes;