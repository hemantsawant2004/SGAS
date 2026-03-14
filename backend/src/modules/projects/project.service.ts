import { Project } from "./project.model";
import { ProjectMember } from "./projectMember.model";
import { CreateProjectDto } from "./project.dto";
import { User } from "../user/user.models";
import { Guide } from "../Guide/guide.model";
import { getGuideProfileByUser } from "../Guide/guide.service";
import { sequelize } from "../../config/database";
import { Transaction } from "sequelize";
import { AuthUser } from "../../types/express";

const NORMALIZE_CLASS_DIVISION = true;
const PROJECT_ALLOCATION_ISSUE_MESSAGES = {
  noActiveGuides: "No active guides are available for allocation. Admin review is required.",
  noCapacity:
    "All active guides have reached maximum capacity. Admin review is required.",
  noGuideAvailable:
    "No guide is currently available for automatic allocation. Admin review is required.",
} as const;

const normalizeAcademicValue = (value: string | null) => {
  if (!value) return "";
  if (!NORMALIZE_CLASS_DIVISION) return value;
  return value.replace(/\s+/g, "").trim().toLowerCase();
};

const getNormalizedGuideExpertise = (rawExpertise: unknown) => {
  let expertise: string[] = [];

  if (Array.isArray(rawExpertise)) {
    expertise = rawExpertise as string[];
  } else if (typeof rawExpertise === "string") {
    try {
      const parsed = JSON.parse(rawExpertise);
      expertise = Array.isArray(parsed) ? parsed : rawExpertise.split(",");
    } catch {
      expertise = rawExpertise.split(",");
    }
  }

  return expertise.map((entry) => entry.trim().toLowerCase()).filter(Boolean);
};

const getProjectTechnologies = (technology: string | null | undefined) =>
  (technology || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const getAllocationIssueCode = async (
  transaction?: Transaction
): Promise<keyof typeof PROJECT_ALLOCATION_ISSUE_MESSAGES> => {
  const activeGuides = await Guide.findAll({
    where: { isActive: true },
    attributes: ["id", "maxProjects"],
    transaction,
  });

  if (!activeGuides.length) {
    return "noActiveGuides";
  }

  for (const guide of activeGuides) {
    const maxProjects = (guide as any).maxProjects ?? 0;

    if (maxProjects <= 0) {
      continue;
    }

    const assignedProjects = await Project.count({
      where: { guideId: guide.id },
      transaction,
    });

    if (assignedProjects < maxProjects) {
      return "noGuideAvailable";
    }
  }

  return "noCapacity";
};

const buildAllocationIssue = (
  code: keyof typeof PROJECT_ALLOCATION_ISSUE_MESSAGES
) => ({
  code,
  message: PROJECT_ALLOCATION_ISSUE_MESSAGES[code],
});

const enrichProjectAllocationState = async (
  project: any,
  transaction?: Transaction
) => {
  const plainProject = typeof project.toJSON === "function" ? project.toJSON() : project;

  if (plainProject.guideId || plainProject.assignedGuide) {
    return {
      ...plainProject,
      allocationIssue: null,
    };
  }

  const issueCode = await getAllocationIssueCode(transaction);

  return {
    ...plainProject,
    allocationIssue: buildAllocationIssue(issueCode),
  };
};

export const createProjectService = async (
  studentId: number,
  payload: CreateProjectDto
) => {
  const memberIds = [...new Set(payload.projectMembers)];

  if (memberIds.length !== payload.projectMembers.length) {
    throw new Error("Duplicate students are not allowed in project members.");
  }

  if (memberIds.includes(studentId)) {
    throw new Error("Project creator should not be added in project members list.");
  }

  return sequelize.transaction(async (transaction) => {
    const preferredGuide = await Guide.findOne({
      where: { id: payload.preferredGuideId, isActive: true },
      attributes: ["id"],
      transaction,
    });

    if (!preferredGuide) {
      throw new Error("Selected preferred guide is invalid or inactive.");
    }

    const [existingCreatorProject, existingCreatorAsMember] = await Promise.all([
      Project.findOne({ where: { studentId }, transaction }),
      ProjectMember.findOne({ where: { studentId }, transaction }),
    ]);

    if (existingCreatorProject || existingCreatorAsMember) {
      throw new Error("You are already assigned to a project.");
    }

    const creator = await User.findOne({
      where: { id: studentId, role: "student" },
      attributes: ["id", "class", "division"],
      transaction,
    });

    if (!creator) {
      throw new Error("Creator student profile not found.");
    }

    const creatorClass = creator.get("class") as string | null;
    const creatorDivision = creator.get("division") as string | null;

    if (!creatorClass || !creatorDivision) {
      throw new Error("Creator must have class and division set.");
    }

    const normalizedCreatorClass = normalizeAcademicValue(creatorClass);
    const normalizedCreatorDivision = normalizeAcademicValue(creatorDivision);

    const memberUsers = await User.findAll({
      where: { id: memberIds, role: "student" },
      attributes: ["id", "class", "division"],
      transaction,
    });

    const foundMemberIds = new Set(memberUsers.map((u) => u.get("id") as number));
    const missingOrInvalidMembers = memberIds.filter((id) => !foundMemberIds.has(id));

    if (missingOrInvalidMembers.length > 0) {
      throw new Error(
        `These member IDs are invalid or not student accounts: ${missingOrInvalidMembers.join(", ")}`
      );
    }

    const classDivisionMismatchIds = memberUsers
      .filter((member) => {
        const normalizedMemberClass = normalizeAcademicValue(member.get("class") as string | null);
        const normalizedMemberDivision = normalizeAcademicValue(
          member.get("division") as string | null
        );

        return (
          normalizedMemberClass !== normalizedCreatorClass ||
          normalizedMemberDivision !== normalizedCreatorDivision
        );
      })
      .map((member) => member.get("id") as number);

    if (classDivisionMismatchIds.length > 0) {
      throw new Error(
        `These students are not in creator's class/division: ${classDivisionMismatchIds.join(", ")}`
      );
    }

    const [membersAlreadyCreators, membersAlreadyMembers] = await Promise.all([
      Project.findAll({
        where: { studentId: memberIds },
        attributes: ["studentId"],
        transaction,
      }),
      ProjectMember.findAll({
        where: { studentId: memberIds },
        attributes: ["studentId"],
        transaction,
      }),
    ]);

    const occupiedStudentIds = new Set<number>();

    for (const row of membersAlreadyCreators) {
      occupiedStudentIds.add(row.get("studentId") as number);
    }

    for (const row of membersAlreadyMembers) {
      occupiedStudentIds.add(row.get("studentId") as number);
    }

    if (occupiedStudentIds.size > 0) {
      throw new Error(
        `These students are already assigned to another project: ${[...occupiedStudentIds].join(", ")}`
      );
    }

    // ✅ Create project inside transaction
    const project = await Project.create(
      {
        title: payload.title,
        description: payload.description,
        technology: payload.technology,     // ✅ matches autoAssign
        studentId,
        preferredGuideId: payload.preferredGuideId,
      },
      { transaction }
    );

    // ✅ Run auto allocation USING SAME TRANSACTION
    const allocationResult = await autoAssignGuideToProject(project.id, transaction);

    // ✅ Create group members
    const membersData = memberIds.map((memberId) => ({
      projectId: project.id,
      studentId: memberId,
    }));

    await ProjectMember.bulkCreate(membersData, { transaction });

    const createdProject = await Project.findByPk(project.id, {
      transaction,
      include: [
        { association: "creator", attributes: ["id", "username", "given_name", "class", "division"] },
        { association: "preferredGuide", attributes: ["id", "fullName"] },
        { association: "assignedGuide", attributes: ["id", "fullName"] },
        {
          association: "members",
          attributes: ["id", "username", "given_name", "class", "division"],
          through: { attributes: [] },
        },
      ],
    });

    const projectWithRelations = createdProject ?? project;

    if (allocationResult.allocationIssue) {
      return enrichProjectAllocationState(projectWithRelations, transaction);
    }

    return enrichProjectAllocationState(projectWithRelations, transaction);
  });
};

export const getActiveGuidesService = async () => {
  return Guide.findAll({
    where: { isActive: true },
    attributes: ["id", "fullName"],
  });
};

export const getStudentsService = async (currentStudentId: number) => {
  const students = await User.findAll({
    where: { role: "student" },
    attributes: ["id", "username"],
  });

  return students.sort((a: any) => (a.id === currentStudentId ? -1 : 1));
};

export const getGuideProjectsService = async (authUser: AuthUser) => {
  const guide = await getGuideProfileByUser(authUser);

  if (!guide) {
    throw new Error("Guide profile not found for the logged-in user.");
  }

  const projects = await Project.findAll({
    where: { guideId: guide.id },
    include: [
      { association: "creator", attributes: ["id", "username", "given_name", "class", "division"] },
      { association: "preferredGuide", attributes: ["id", "fullName"] },
      { association: "assignedGuide", attributes: ["id", "fullName"] },
      {
        association: "members",
        attributes: ["id", "username", "given_name", "class", "division"],
        through: { attributes: [] },
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return Promise.all(projects.map((project) => enrichProjectAllocationState(project)));
};

export const getMyProjectsService = async (studentId: number) => {
  const projects = await Project.findAll({
    where: { studentId },
    include: [
      { association: "creator", attributes: ["id", "username", "given_name", "class", "division"] },
      { association: "preferredGuide", attributes: ["id", "fullName"] },
      { association: "assignedGuide", attributes: ["id", "fullName"] },
      {
        association: "members",
        attributes: ["id", "username", "given_name", "class", "division"],
        through: { attributes: [] },
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return Promise.all(projects.map((project) => enrichProjectAllocationState(project)));
};

export const getAdminOverviewService = async () => {
  const projects = await Project.findAll({
    include: [
      {
        association: "creator",
        attributes: ["id", "username", "given_name", "class", "division", "rollNumber"],
      },
      { association: "preferredGuide", attributes: ["id", "fullName", "departmentName"] },
      { association: "assignedGuide", attributes: ["id", "fullName", "departmentName"] },
      {
        association: "members",
        attributes: ["id", "username", "given_name", "class", "division", "rollNumber"],
        through: { attributes: [] },
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  const guides = await Guide.findAll({
    attributes: [
      "id",
      "fullName",
      "departmentName",
      "isActive",
      "maxProjects",
      "username",
    ],
    order: [["fullName", "ASC"]],
  });

  const students = await User.findAll({
    where: { role: "student" },
    attributes: ["id", "username", "given_name", "class", "division", "rollNumber"],
    order: [["username", "ASC"]],
  });

  const projectsByGuideId = new Map<number, number>();
  const projectsByStudentId = new Map<number, number>();

  for (const project of projects as any[]) {
    if (project.guideId) {
      projectsByGuideId.set(
        project.guideId,
        (projectsByGuideId.get(project.guideId) ?? 0) + 1
      );
    }

    if (project.studentId) {
      projectsByStudentId.set(
        project.studentId,
        (projectsByStudentId.get(project.studentId) ?? 0) + 1
      );
    }

    for (const member of project.members ?? []) {
      const memberId = member.id as number;
      projectsByStudentId.set(memberId, (projectsByStudentId.get(memberId) ?? 0) + 1);
    }
  }

  const guideActivity = guides.map((guide: any) => ({
    id: guide.id,
    fullName: guide.fullName,
    departmentName: guide.departmentName,
    username: guide.username,
    isActive: guide.isActive,
    maxProjects: guide.maxProjects,
    assignedProjects: projectsByGuideId.get(guide.id) ?? 0,
    remainingCapacity: Math.max((guide.maxProjects ?? 0) - (projectsByGuideId.get(guide.id) ?? 0), 0),
  }));

  const studentActivity = students.map((student: any) => ({
    id: student.id,
    username: student.username,
    fullName: student.given_name,
    class: student.get("class"),
    division: student.get("division"),
    rollNumber: student.get("rollNumber"),
    projectCount: projectsByStudentId.get(student.id) ?? 0,
    isAssigned: (projectsByStudentId.get(student.id) ?? 0) > 0,
  }));

  const projectsWithAllocationState = await Promise.all(
    (projects as any[]).map((project) => enrichProjectAllocationState(project))
  );

  const allocationAlerts = projectsWithAllocationState
    .filter((project: any) => project.allocationIssue)
    .map((project: any) => ({
      projectId: project.id,
      projectTitle: project.title,
      issueCode: project.allocationIssue.code,
      message: project.allocationIssue.message,
      creatorName:
        project.creator?.given_name ||
        project.creator?.username ||
        `Student ${project.studentId}`,
      preferredGuideName:
        project.preferredGuide?.fullName ||
        project.preferredGuide?.fullname ||
        null,
    }));

  return {
    summary: {
      totalProjects: projectsWithAllocationState.length,
      allocatedProjects: projectsWithAllocationState.filter((project: any) => Boolean(project.guideId)).length,
      unallocatedProjects: projectsWithAllocationState.filter((project: any) => !project.guideId).length,
      totalGuideActivities: guideActivity.filter((guide) => guide.assignedProjects > 0).length,
      totalStudentActivities: studentActivity.filter((student) => student.projectCount > 0).length,
    },
    projects: projectsWithAllocationState,
    guideActivity,
    studentActivity,
    allocationAlerts,
  };
};

export const deleteProjectService = async (
  projectId: number,
  authUser: AuthUser
) => {
  return sequelize.transaction(async (transaction) => {
    const project = await Project.findByPk(projectId, { transaction });

    if (!project) {
      throw new Error("Project not found.");
    }

    if (authUser.role === "guide") {
      const guide = await getGuideProfileByUser(authUser);

      if (!guide) {
        throw new Error("Guide profile not found for the logged-in user.");
      }

      if ((project as any).guideId !== guide.id) {
        throw new Error("You can delete only projects assigned to you.");
      }
    } else if (authUser.role !== "admin") {
      throw new Error("You are not allowed to delete this project.");
    }

    await ProjectMember.destroy({
      where: { projectId: project.id },
      transaction,
    });

    await project.destroy({ transaction });

    return { id: projectId };
  });
};

export const manuallyAssignGuideToProjectService = async (
  projectId: number,
  guideId: number
) => {
  return sequelize.transaction(async (transaction) => {
    const project = await Project.findByPk(projectId, { transaction });

    if (!project) {
      throw new Error("Project not found.");
    }

    if ((project as any).guideId) {
      throw new Error("Only pending projects can be manually allocated.");
    }

    const guide = await Guide.findOne({
      where: { id: guideId, isActive: true },
      transaction,
    });

    if (!guide) {
      throw new Error("Selected guide is invalid or inactive.");
    }

    const currentAssignedProjects = await Project.count({
      where: { guideId: guide.id },
      transaction,
    });

    const currentMaxProjects = (guide as any).maxProjects ?? 0;

    if (currentAssignedProjects >= currentMaxProjects) {
      (guide as any).maxProjects = currentAssignedProjects + 1;
      await guide.save({ transaction });
    }

    (project as any).guideId = guide.id;
    await project.save({ transaction });

    const updatedProject = await Project.findByPk(project.id, {
      transaction,
      include: [
        { association: "creator", attributes: ["id", "username", "given_name", "class", "division"] },
        { association: "preferredGuide", attributes: ["id", "fullName"] },
        { association: "assignedGuide", attributes: ["id", "fullName"] },
        {
          association: "members",
          attributes: ["id", "username", "given_name", "class", "division"],
          through: { attributes: [] },
        },
      ],
    });

    return enrichProjectAllocationState(updatedProject ?? project, transaction);
  });
};


export const autoAssignGuideToProject = async (
  projectId: number,
  transaction?: Transaction
) => {
  // 1. Get project (inside same transaction if passed)
  const project = await Project.findByPk(projectId, { transaction });

  if (!project) {
    throw new Error("Project not found");
  }

  // project.technology -> "html, css, js"
  const technologiesText = (project as any).technology || "";
  const preferredGuideId = (project as any).preferredGuideId ?? null;

  const projectTechs = getProjectTechnologies(technologiesText);

  // 2. Get all active guides
  const guides = await Guide.findAll({
    where: {
      isActive: true,
    },
    transaction,
  });

  const scoredGuides: {
    guide: typeof Guide.prototype;
    score: number;
    currentAssigned: number;
  }[] = [];

  // 3. Evaluate each guide
  for (const guide of guides) {
    // Count how many projects already assigned to this guide
    const currentAssigned = await Project.count({
      where: {
        guideId: guide.id,            // ✅ use assigned guide, not preferredGuideId
      },
      transaction,
    });

    // Skip guide if at or above maxProjects
    const maxProjects = (guide as any).maxProjects ?? 0;

    if (!maxProjects || currentAssigned >= maxProjects) {
      continue;
    }

    // Parse expertise array
    const normalizedExpertise = getNormalizedGuideExpertise((guide as any).expertise);

    // Skill match
    let skillMatchCount = 0;
    for (const tech of projectTechs) {
      if (normalizedExpertise.includes(tech)) {
        skillMatchCount++;
      }
    }

    const skillScore =
      projectTechs.length > 0
        ? (skillMatchCount / projectTechs.length) * 70
        : 0;

    // Preferred guide bonus
    const preferredBonus =
      preferredGuideId && preferredGuideId === guide.id ? 20 : 0;

    // Load factor (more free capacity = better)
    const loadScore =
      maxProjects > 0
        ? ((maxProjects - currentAssigned) / maxProjects) * 10
        : 0;

    const totalScore = skillScore + preferredBonus + loadScore;

    if (totalScore <= 0) continue;

    scoredGuides.push({ guide, score: totalScore, currentAssigned });
  }

  if (!scoredGuides.length) {
    const issueCode = await getAllocationIssueCode(transaction);

    return {
      project,
      assignedGuide: null,
      allocationIssue: buildAllocationIssue(issueCode),
    };
  }

  // 4. Pick best guide
  scoredGuides.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.currentAssigned !== b.currentAssigned)
      return a.currentAssigned - b.currentAssigned;
    return a.guide.id - b.guide.id;
  });

  const best = scoredGuides[0].guide;

  // 5. Assign guide to project
  (project as any).guideId = best.id;   // ✅ make sure you have guideId column in projects table
  await project.save({ transaction });

  return {
    project,
    assignedGuide: best,
    allocationIssue: null,
  };
};
