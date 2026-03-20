import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { Transaction } from "sequelize";
import { sequelize } from "../../config/database";
import { AuthUser } from "../../types/express";
import { getGuideProfileByUser } from "../Guide/guide.service";
import { Guide } from "../Guide/guide.model";
import { User } from "../user/user.models";
import {
  CreateProjectDto,
  CreateProjectProgressDto,
  ReviewProjectProgressDto,
} from "./project.dto";
import { Project } from "./project.model";
import { buildDefaultProjectPhaseStatuses, PROJECT_PHASES } from "./project.model";
import { ProjectMember } from "./projectMember.model";
import { ProjectProgress } from "./projectProgress.model";

const NORMALIZE_CLASS_DIVISION = true;
const MAX_PROGRESS_FILE_BYTES = 5 * 1024 * 1024;
const PROJECT_PROGRESS_UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "project-progress");
const PROJECT_ALLOCATION_ISSUE_MESSAGES = {
  noActiveGuides: "No active guides are available for allocation. Admin review is required.",
  noCapacity:
    "All active guides have reached maximum capacity. Admin review is required.",
  noGuideAvailable:
    "No guide is currently available for allocation. Admin review is required.",
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

const sanitizeFileSegment = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 120);

const parseBase64Payload = (fileBase64: string) => {
  const normalized = fileBase64.includes(",") ? fileBase64.split(",").pop() ?? "" : fileBase64;
  const buffer = Buffer.from(normalized, "base64");

  if (!buffer.length) {
    throw new Error("Uploaded file is empty or invalid.");
  }

  if (buffer.length > MAX_PROGRESS_FILE_BYTES) {
    throw new Error("Uploaded file exceeds the 5MB limit.");
  }

  return buffer;
};

const saveProgressAttachment = async (payload: CreateProjectProgressDto) => {
  if (!payload.fileBase64 || !payload.fileName || !payload.fileMimeType) {
    return {
      fileName: null,
      fileUrl: null,
      fileMimeType: null,
      fileSize: null,
      absolutePath: null,
    };
  }

  const buffer = parseBase64Payload(payload.fileBase64);
  const safeFileName = sanitizeFileSegment(payload.fileName);
  const extension = path.extname(safeFileName) || "";
  const baseName = path.basename(safeFileName, extension) || "progress-file";
  const storedFileName = `${Date.now()}-${randomUUID()}-${baseName}${extension}`;

  await fs.mkdir(PROJECT_PROGRESS_UPLOAD_DIR, { recursive: true });

  const absolutePath = path.join(PROJECT_PROGRESS_UPLOAD_DIR, storedFileName);
  await fs.writeFile(absolutePath, buffer);

  return {
    fileName: payload.fileName,
    fileUrl: `/uploads/project-progress/${storedFileName}`,
    fileMimeType: payload.fileMimeType,
    fileSize: buffer.length,
    absolutePath,
  };
};

const removeStoredFile = async (fileUrl: string | null | undefined) => {
  if (!fileUrl) return;

  const relativePath = fileUrl.replace(/^\/+/, "");
  const absolutePath = path.resolve(process.cwd(), relativePath);

  try {
    await fs.unlink(absolutePath);
  } catch {
    // Ignore missing files during cleanup.
  }
};

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

const normalizeProjectPhaseStatuses = (phaseStatuses: unknown) => {
  const defaults = buildDefaultProjectPhaseStatuses();

  if (!Array.isArray(phaseStatuses)) {
    return defaults;
  }

  const existingStatuses = new Map<string, "pending" | "in_progress" | "completed">();

  for (const entry of phaseStatuses) {
    if (
      entry &&
      typeof entry === "object" &&
      "phase" in entry &&
      "status" in entry &&
      typeof (entry as any).phase === "string" &&
      ((entry as any).status === "pending" ||
        (entry as any).status === "in_progress" ||
        (entry as any).status === "completed")
    ) {
      existingStatuses.set((entry as any).phase, (entry as any).status);
    }
  }

  return defaults.map((entry) => ({
    phase: entry.phase,
    status: existingStatuses.get(entry.phase) ?? entry.status,
  }));
};

const getProjectPhaseStatus = (
  project: Project,
  phase: (typeof PROJECT_PHASES)[number]
) => {
  const currentStatuses = normalizeProjectPhaseStatuses((project as any).phaseStatuses);
  return currentStatuses.find((entry) => entry.phase === phase)?.status ?? "pending";
};

const setProjectPhaseStatus = async (
  project: Project,
  phase: (typeof PROJECT_PHASES)[number],
  status: "pending" | "in_progress" | "completed",
  transaction?: Transaction
) => {
  const currentStatuses = normalizeProjectPhaseStatuses((project as any).phaseStatuses);

  (project as any).phaseStatuses = currentStatuses.map((entry) =>
    entry.phase === phase ? { ...entry, status } : entry
  );

  await project.save({ transaction });
};

const recalculateProjectPhaseStatusAfterProgressDelete = async (
  project: Project,
  phase: (typeof PROJECT_PHASES)[number],
  transaction?: Transaction
) => {
  const remainingProgress = await ProjectProgress.findAll({
    where: {
      projectId: project.id,
      phase,
    },
    attributes: ["remarkStatus"],
    transaction,
  });

  if (!remainingProgress.length) {
    await setProjectPhaseStatus(project, phase, "pending", transaction);
    return;
  }

  const hasCompleted = remainingProgress.some(
    (entry) => entry.remarkStatus === "completed"
  );

  await setProjectPhaseStatus(
    project,
    phase,
    hasCompleted ? "completed" : "in_progress",
    transaction
  );
};

const getProjectWithRelations = async (
  projectId: number,
  transaction?: Transaction
) =>
  Project.findByPk(projectId, {
    transaction,
    include: [
      { association: "creator", attributes: ["id", "username", "given_name", "class", "division"] },
      { association: "preferredGuide", attributes: ["id", "fullName", "isActive"] },
      { association: "assignedGuide", attributes: ["id", "fullName", "isActive"] },
      {
        association: "members",
        attributes: ["id", "username", "given_name", "class", "division"],
        through: { attributes: [] },
      },
    ],
  });

const canStudentAccessProject = async (
  projectId: number,
  studentId: number,
  transaction?: Transaction
) => {
  const project = await Project.findByPk(projectId, { transaction });

  if (!project) {
    throw new Error("Project not found.");
  }

  if ((project as any).studentId === studentId) {
    return project;
  }

  const membership = await ProjectMember.findOne({
    where: { projectId, studentId },
    transaction,
  });

  if (!membership) {
    throw new Error("You are not allowed to access this project.");
  }

  return project;
};

const assertGuideOwnsProject = async (
  projectId: number,
  authUser: AuthUser,
  transaction?: Transaction
) => {
  const guide = await getGuideProfileByUser(authUser);

  if (!guide) {
    throw new Error("Guide profile not found for the logged-in user.");
  }

  const project = await Project.findByPk(projectId, { transaction });

  if (!project) {
    throw new Error("Project not found.");
  }

  if ((project as any).guideId !== guide.id) {
    throw new Error("You are not allowed to access this project.");
  }

  return { project, guide };
};

const getProjectStatusSummary = (project: any) => {
  const phaseStatuses = normalizeProjectPhaseStatuses(project.phaseStatuses);
  const firstOpenPhase = phaseStatuses.find((entry) => entry.status !== "completed");

  if (!firstOpenPhase) {
    return {
      currentPhase: "Completed",
      currentPhaseStatus: "completed" as const,
    };
  }

  return {
    currentPhase: firstOpenPhase.phase,
    currentPhaseStatus: firstOpenPhase.status,
  };
};
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
    throw new Error("A student has already been added to this project. Please select a different student.");
  }

  if (memberIds.includes(studentId)) {
    throw new Error("You cannot add yourself as a project member");
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
        `These students are not in your class/division`
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
        preferredGuideId: payload.preferredGuideId,
        phaseStatuses: buildDefaultProjectPhaseStatuses(),
      },
      { transaction }
    );

    const allocationResult = await autoAssignGuideToProject(project.id, transaction);

    const membersData = memberIds.map((memberId) => ({
      projectId: project.id,
      studentId: memberId,
    }));

    await ProjectMember.bulkCreate(membersData, { transaction });

    const createdProject = await getProjectWithRelations(project.id, transaction);
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
    attributes: ["id", "fullName", "isActive"],
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
      { association: "preferredGuide", attributes: ["id", "fullName", "isActive"] },
      { association: "assignedGuide", attributes: ["id", "fullName", "isActive"] },
      {
        association: "members",
        attributes: ["id", "username", "given_name", "class", "division"],
        through: { attributes: [] },
      },
    ],
    order: [["updatedAt", "DESC"], ["createdAt", "DESC"]],
  });

  return Promise.all(projects.map((project) => enrichProjectAllocationState(project)));
};

export const getMyProjectsService = async (studentId: number) => {
  const projects = await Project.findAll({
    where: { studentId },
    include: [
      { association: "creator", attributes: ["id", "username", "given_name", "class", "division"] },
      { association: "preferredGuide", attributes: ["id", "fullName", "isActive"] },
      { association: "assignedGuide", attributes: ["id", "fullName", "isActive"] },
      {
        association: "members",
        attributes: ["id", "username", "given_name", "class", "division"],
        through: { attributes: [] },
      },
    ],
    order: [["updatedAt", "DESC"], ["createdAt", "DESC"]],
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
    order: [["updatedAt", "DESC"], ["createdAt", "DESC"]],
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


  const latestCompletedProgressByProjectId = new Map<number, string>();
  const completedProgressUpdates = await ProjectProgress.findAll({
    where: { remarkStatus: "completed" },
    attributes: ["projectId", "reviewedAt", "updatedAt"],
    order: [["reviewedAt", "DESC"], ["updatedAt", "DESC"]],
  });

  for (const progress of completedProgressUpdates) {
    if (!latestCompletedProgressByProjectId.has(progress.projectId)) {
      latestCompletedProgressByProjectId.set(
        progress.projectId,
        (((progress.reviewedAt ?? (progress as any).updatedAt) as Date)).toISOString()
      );
    }
  }
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
    (projects as any[]).map(async (project) => {
      const enrichedProject = await enrichProjectAllocationState(project);
      const statusSummary = getProjectStatusSummary(enrichedProject);

      return {
        ...enrichedProject,
        currentPhase: statusSummary.currentPhase,
        currentPhaseStatus: statusSummary.currentPhaseStatus,
        completedAt:
          statusSummary.currentPhaseStatus === "completed"
            ? latestCompletedProgressByProjectId.get(enrichedProject.id) ?? null
            : null,
      };
    })
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

    const progressRows = await ProjectProgress.findAll({
      where: { projectId: project.id },
      transaction,
    });

    for (const progress of progressRows) {
      await removeStoredFile(progress.fileUrl);
    }

    await ProjectProgress.destroy({
      where: { projectId: project.id },
      transaction,
    });

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

    const updatedProject = await getProjectWithRelations(project.id, transaction);

    return enrichProjectAllocationState(updatedProject ?? project, transaction);
  });
};

export const createProjectProgressService = async (
  projectId: number,
  authUser: AuthUser,
  payload: CreateProjectProgressDto
) => {
  const attachment = await saveProgressAttachment(payload);

  try {
    return await sequelize.transaction(async (transaction) => {
      const project = await canStudentAccessProject(projectId, authUser.id, transaction);

      if (!(project as any).guideId) {
        throw new Error("This project is not allocated to any guide yet.");
      }

      const assignedGuide = await Guide.findByPk((project as any).guideId, {
        attributes: ["id", "isActive"],
        transaction,
      });

      if (!assignedGuide || !(assignedGuide as any).isActive) {
        throw new Error(
          "Progress cannot be submitted because the assigned guide is inactive. Please contact admin."
        );
      }

      if (getProjectPhaseStatus(project, payload.phase) === "completed") {
        throw new Error("Progress cannot be sent for a phase that is already completed.");
      }

      const existingNeedsChangesProgress = await ProjectProgress.findOne({
        where: {
          projectId: project.id,
          studentId: authUser.id,
          phase: payload.phase,
          remarkStatus: "needs_changes",
        },
        order: [["updatedAt", "DESC"]],
        transaction,
      });

      await setProjectPhaseStatus(project, payload.phase, "in_progress", transaction);

      if (existingNeedsChangesProgress) {
        const previousFileUrl = existingNeedsChangesProgress.fileUrl;

        existingNeedsChangesProgress.progressText = payload.progressText.trim();
        existingNeedsChangesProgress.remarkStatus = "pending";
        existingNeedsChangesProgress.fileName = attachment.fileName ?? existingNeedsChangesProgress.fileName;
        existingNeedsChangesProgress.fileUrl = attachment.fileUrl ?? existingNeedsChangesProgress.fileUrl;
        existingNeedsChangesProgress.fileMimeType = attachment.fileMimeType ?? existingNeedsChangesProgress.fileMimeType;
        existingNeedsChangesProgress.fileSize = attachment.fileSize ?? existingNeedsChangesProgress.fileSize;
        await existingNeedsChangesProgress.save({ transaction });

        if (attachment.fileUrl && previousFileUrl && previousFileUrl !== attachment.fileUrl) {
          await removeStoredFile(previousFileUrl);
        }

        return ProjectProgress.findByPk(existingNeedsChangesProgress.id, {
          transaction,
          include: [{ association: "student", attributes: ["id", "username", "given_name"] }],
        });
      }

      const progress = await ProjectProgress.create(
        {
          projectId: project.id,
          studentId: authUser.id,
          phase: payload.phase,
          progressText: payload.progressText.trim(),
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          fileMimeType: attachment.fileMimeType,
          fileSize: attachment.fileSize,
        },
        { transaction }
      );

      return ProjectProgress.findByPk(progress.id, {
        transaction,
        include: [{ association: "student", attributes: ["id", "username", "given_name"] }],
      });
    });
  } catch (error) {
    if (attachment.fileUrl) {
      await removeStoredFile(attachment.fileUrl);
    }
    throw error;
  }
};

export const getProjectProgressService = async (
  projectId: number,
  authUser: AuthUser
) => {
  if (authUser.role === "student") {
    await canStudentAccessProject(projectId, authUser.id);
  } else if (authUser.role === "guide") {
    await assertGuideOwnsProject(projectId, authUser);
  } else {
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new Error("Project not found.");
    }
  }

  return ProjectProgress.findAll({
    where: { projectId },
    include: [{ association: "student", attributes: ["id", "username", "given_name"] }],
    order: [["updatedAt", "DESC"], ["createdAt", "DESC"]],
  });
};

export const reviewProjectProgressService = async (
  progressId: number,
  authUser: AuthUser,
  payload: ReviewProjectProgressDto
) => {
  return sequelize.transaction(async (transaction) => {
    const progress = await ProjectProgress.findByPk(progressId, { transaction });

    if (!progress) {
      throw new Error("Project progress not found.");
    }

    const { project } = await assertGuideOwnsProject(progress.projectId, authUser, transaction);

    progress.guideReply = payload.guideReply;
    progress.remarkStatus = payload.remarkStatus;
    progress.reviewedAt = new Date();
    await progress.save({ transaction });

    await setProjectPhaseStatus(
      project,
      progress.phase,
      payload.remarkStatus === "completed" ? "completed" : "in_progress",
      transaction
    );

    return ProjectProgress.findByPk(progress.id, {
      transaction,
      include: [{ association: "student", attributes: ["id", "username", "given_name"] }],
    });
  });
};

export const deleteProjectProgressService = async (
  progressId: number,
  authUser: AuthUser
) => {
  return sequelize.transaction(async (transaction) => {
    const progress = await ProjectProgress.findByPk(progressId, { transaction });

    if (!progress) {
      throw new Error("Project progress not found.");
    }

    if (progress.studentId !== authUser.id) {
      throw new Error("You are not allowed to delete this progress.");
    }

    if (progress.remarkStatus !== "pending") {
      throw new Error("Only progress with pending status can be deleted.");
    }

    const project = await canStudentAccessProject(progress.projectId, authUser.id, transaction);

    const fileUrl = progress.fileUrl;
    const phase = progress.phase;

    await progress.destroy({ transaction });
    await recalculateProjectPhaseStatusAfterProgressDelete(project, phase, transaction);

    if (fileUrl) {
      await removeStoredFile(fileUrl);
    }

    return { id: progressId };
  });
};

export const autoAssignGuideToProject = async (
  projectId: number,
  transaction?: Transaction
) => {
  const project = await Project.findByPk(projectId, { transaction });

  if (!project) {
    throw new Error("Project not found");
  }

  const technologiesText = (project as any).technology || "";
  const preferredGuideId = (project as any).preferredGuideId ?? null;

  const projectTechs = getProjectTechnologies(technologiesText);

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

  for (const guide of guides) {
    const currentAssigned = await Project.count({
      where: {
        guideId: guide.id,
      },
      transaction,
    });

    const maxProjects = (guide as any).maxProjects ?? 0;

    if (!maxProjects || currentAssigned >= maxProjects) {
      continue;
    }

    const normalizedExpertise = getNormalizedGuideExpertise((guide as any).expertise);

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

    const preferredBonus =
      preferredGuideId && preferredGuideId === guide.id ? 20 : 0;

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

  scoredGuides.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.currentAssigned !== b.currentAssigned)
      return a.currentAssigned - b.currentAssigned;
    return a.guide.id - b.guide.id;
  });

  const best = scoredGuides[0].guide;

  (project as any).guideId = best.id;
  await project.save({ transaction });

  return {
    project,
    assignedGuide: best,
    allocationIssue: null,
  };
};











