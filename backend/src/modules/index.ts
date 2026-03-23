import { Guide } from "./Guide/guide.model";
import { User } from "./user/user.models";
import { Project } from "./projects/project.model";
import { ProjectMember } from "./projects/projectMember.model";
import { ProjectProgress } from "./projects/projectProgress.model";
import { Notification } from "./notifications/notification.model";

User.hasMany(Project, { foreignKey: "studentId" });
Project.belongsTo(User, { foreignKey: "studentId", as: "creator" });

Guide.hasMany(Project, { foreignKey: "preferredGuideId" });
Project.belongsTo(Guide, {
  foreignKey: "preferredGuideId",
  as: "preferredGuide",
});

Guide.hasMany(Project, { foreignKey: "guideId", as: "assignedProjects" });
Project.belongsTo(Guide, {
  foreignKey: "guideId",
  as: "assignedGuide",
});

Project.hasMany(ProjectProgress, {
  foreignKey: "projectId",
  as: "progressUpdates",
});
ProjectProgress.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});

User.hasMany(ProjectProgress, {
  foreignKey: "studentId",
  as: "submittedProjectProgress",
});
ProjectProgress.belongsTo(User, {
  foreignKey: "studentId",
  as: "student",
});

Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: "projectId",
  as: "members",
});

User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: "studentId",
  as: "joinedProjects",
});

User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
});

Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "recipient",
});
