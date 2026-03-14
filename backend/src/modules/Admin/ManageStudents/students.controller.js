"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudents = exports.updateStudents = exports.getStudents = void 0;
const students_service_1 = require("./students.service");
//get students
const getStudents = async (req, res) => {
    const students = await (0, students_service_1.getAllStudents)();
    res.status(200).json({
        success: true,
        data: students,
    });
};
exports.getStudents = getStudents;
//update student
const updateStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedStudent = await (0, students_service_1.updateStudent)(Number(id), updateData);
        res.status(200).json({
            success: true,
            data: updatedStudent,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
exports.updateStudents = updateStudents;
const deleteStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, students_service_1.deleteStudent)(Number(id));
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
exports.deleteStudents = deleteStudents;
