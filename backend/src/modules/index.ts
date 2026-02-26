import { Guide } from "./Guide/guide.model";
import { User } from "./user/user.models";
import { Project } from "./projects/project.model";
import { ProjectMember } from "./projects/projectMember.model";

// Student created project
User.hasMany(Project, { foreignKey: "studentId" });
Project.belongsTo(User, { foreignKey: "studentId", as: "creator" });

// Guide relation
Guide.hasMany(Project, { foreignKey: "preferredGuideId" });
Project.belongsTo(Guide, {
  foreignKey: "preferredGuideId",
  as: "preferredGuide",
});

// Many-to-Many
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