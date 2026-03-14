"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const guide_model_1 = require("./Guide/guide.model");
const user_models_1 = require("./user/user.models");
const project_model_1 = require("./projects/project.model");
const projectMember_model_1 = require("./projects/projectMember.model");
// Student created project
user_models_1.User.hasMany(project_model_1.Project, { foreignKey: "studentId" });
project_model_1.Project.belongsTo(user_models_1.User, { foreignKey: "studentId", as: "creator" });
// Guide relation
guide_model_1.Guide.hasMany(project_model_1.Project, { foreignKey: "preferredGuideId" });
project_model_1.Project.belongsTo(guide_model_1.Guide, {
    foreignKey: "preferredGuideId",
    as: "preferredGuide",
});
guide_model_1.Guide.hasMany(project_model_1.Project, { foreignKey: "guideId", as: "assignedProjects" });
project_model_1.Project.belongsTo(guide_model_1.Guide, {
    foreignKey: "guideId",
    as: "assignedGuide",
});
// Many-to-Many
project_model_1.Project.belongsToMany(user_models_1.User, {
    through: projectMember_model_1.ProjectMember,
    foreignKey: "projectId",
    as: "members",
});
user_models_1.User.belongsToMany(project_model_1.Project, {
    through: projectMember_model_1.ProjectMember,
    foreignKey: "studentId",
    as: "joinedProjects",
});
