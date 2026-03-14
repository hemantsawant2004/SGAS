"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getallGuides = void 0;
const guides_service_1 = require("./guides.service");
const getallGuides = async (req, res) => {
    const guides = await (0, guides_service_1.getAllGuides)();
    res.status(200).json({
        success: true,
        data: guides,
    });
};
exports.getallGuides = getallGuides;
