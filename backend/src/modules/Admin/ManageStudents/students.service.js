"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.getAllStudents = void 0;
const user_models_1 = require("../../user/user.models");
//get students
const getAllStudents = async () => {
    const students = await user_models_1.User.findAll({
        attributes: [
            "id",
            "username",
            "role",
        ],
        where: { role: "student" }
    });
    return students;
};
exports.getAllStudents = getAllStudents;
//update
const updateStudent = async (id, updateData) => {
    const student = await user_models_1.User.findOne({
        where: { id, role: "student" },
    });
    if (!student) {
        throw new Error("student not found");
    }
    await student.update(updateData);
    return student;
};
exports.updateStudent = updateStudent;
//delete
const deleteStudent = async (id) => {
    const student = await user_models_1.User.findOne({
        where: { id, role: "student" },
    });
    if (!student) {
        throw new Error("student not found");
    }
    await student.destroy();
    return { message: "student deleted successfully" };
};
exports.deleteStudent = deleteStudent;
