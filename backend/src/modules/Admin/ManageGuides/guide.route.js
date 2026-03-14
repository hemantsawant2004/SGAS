"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const guide_controller_1 = require("./guide.controller");
const guide_controller_2 = require("./guide.controller");
const AdminGuideRoutes = (0, express_1.Router)();
AdminGuideRoutes.get("/", guide_controller_1.getGuides);
AdminGuideRoutes.patch("/:id/deactivate", guide_controller_2.deactivateGuide);
AdminGuideRoutes.patch("/:id/reactivate", guide_controller_1.activateGuide);
AdminGuideRoutes.delete("/:id/delete", guide_controller_1.removeGuide);
AdminGuideRoutes.patch("/:id/max-projects", guide_controller_1.setGuideMaxProjects); //to specific guide
AdminGuideRoutes.patch("/max-projects", guide_controller_1.setAllGuidesMaxProjects); //to all guides at a time
exports.default = AdminGuideRoutes;
