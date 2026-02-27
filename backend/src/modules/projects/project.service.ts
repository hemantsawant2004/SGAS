import { Project } from "./project.model";
import { ProjectMember } from "./projectMember.model";
import { CreateProjectDto } from "./project.dto";
import { User } from "../user/user.models";
import { Guide } from "../Guide/guide.model";
import { sequelize } from "../../config/database";

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

    const project = await Project.create(
      {
        title: payload.title,
        description: payload.description,
        technology: payload.technology,
        studentId,
        // Student preference only; allocation happens later via algorithm.
        preferredGuideId: payload.preferredGuideId,
      },
      { transaction }
    );

    const membersData = memberIds.map((memberId) => ({
      projectId: project.id,
      studentId: memberId,
    }));

    await ProjectMember.bulkCreate(membersData, { transaction });

    return project;
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

export const getGuideProjectsService = async (_authUserId: number) => {
  // Do not treat preferredGuideId as actual allocation.
  // This endpoint should return algorithm-assigned projects once allocation fields are introduced.
  return [];
};

export const getMyProjectsService = async (studentId: number) => {
  return Project.findAll({
    where: { studentId },
    include: [
      { association: "preferredGuide", attributes: ["id", "fullName"] },
      {
        association: "members",
        attributes: ["id", "username"],
        through: { attributes: [] },
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};
