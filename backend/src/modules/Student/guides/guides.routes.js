"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const guides_controller_1 = require("./guides.controller");
const StudentGuideRoutes = (0, express_1.Router)();
StudentGuideRoutes.get("/", guides_controller_1.getallGuides);
exports.default = StudentGuideRoutes;
