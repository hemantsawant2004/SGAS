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

const normalizeAcademicValue = (value: string | null) => {
  if (!value) return "";
  if (!NORMALIZE_CLASS_DIVISION) return value;
  return value.replace(/\s+/g, "").trim().toLowerCase();
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
    await autoAssignGuideToProject(project.id, transaction);

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

    return createdProject ?? project;
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

  return Project.findAll({
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
};

export const getMyProjectsService = async (studentId: number) => {
  return Project.findAll({
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

  const projectTechs = technologiesText
    .split(",")
    .map((t: string) => t.trim().toLowerCase())
    .filter(Boolean);

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
    let expertise: string[] = [];
    const rawExpertise = (guide as any).expertise;

    if (Array.isArray(rawExpertise)) {
      expertise = rawExpertise;
    } else if (typeof rawExpertise === "string") {
      try {
        const parsed = JSON.parse(rawExpertise);
        if (Array.isArray(parsed)) {
          expertise = parsed;
        } else {
          expertise = rawExpertise.split(",");
        }
      } catch {
        expertise = rawExpertise.split(",");
      }
    }

    const normalizedExpertise = expertise
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

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
    throw new Error("No eligible guides available for allocation");
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
  };
};
