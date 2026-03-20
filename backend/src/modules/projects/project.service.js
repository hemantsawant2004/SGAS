"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoAssignGuideToProject = exports.deleteProjectProgressService = exports.reviewProjectProgressService = exports.getProjectProgressService = exports.createProjectProgressService = exports.manuallyAssignGuideToProjectService = exports.deleteProjectService = exports.getAdminOverviewService = exports.getMyProjectsService = exports.getGuideProjectsService = exports.getStudentsService = exports.getActiveGuidesService = exports.createProjectService = void 0;
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const database_1 = require("../../config/database");
const guide_service_1 = require("../Guide/guide.service");
const guide_model_1 = require("../Guide/guide.model");
const user_models_1 = require("../user/user.models");
const project_model_1 = require("./project.model");
const project_model_2 = require("./project.model");
const projectMember_model_1 = require("./projectMember.model");
const projectProgress_model_1 = require("./projectProgress.model");
const NORMALIZE_CLASS_DIVISION = true;
const MAX_PROGRESS_FILE_BYTES = 5 * 1024 * 1024;
const PROJECT_PROGRESS_UPLOAD_DIR = path_1.default.resolve(process.cwd(), "uploads", "project-progress");
const PROJECT_ALLOCATION_ISSUE_MESSAGES = {
    noActiveGuides: "No active guides are available for allocation. Admin review is required.",
    noCapacity: "All active guides have reached maximum capacity. Admin review is required.",
    noGuideAvailable: "No guide is currently available for allocation. Admin review is required.",
};
const normalizeAcademicValue = (value) => {
    if (!value)
        return "";
    if (!NORMALIZE_CLASS_DIVISION)
        return value;
    return value.replace(/\s+/g, "").trim().toLowerCase();
};
const getNormalizedGuideExpertise = (rawExpertise) => {
    let expertise = [];
    if (Array.isArray(rawExpertise)) {
        expertise = rawExpertise;
    }
    else if (typeof rawExpertise === "string") {
        try {
            const parsed = JSON.parse(rawExpertise);
            expertise = Array.isArray(parsed) ? parsed : rawExpertise.split(",");
        }
        catch {
            expertise = rawExpertise.split(",");
        }
    }
    return expertise.map((entry) => entry.trim().toLowerCase()).filter(Boolean);
};
const getProjectTechnologies = (technology) => (technology || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
const sanitizeFileSegment = (value) => value.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 120);
const parseBase64Payload = (fileBase64) => {
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
const saveProgressAttachment = async (payload) => {
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
    const extension = path_1.default.extname(safeFileName) || "";
    const baseName = path_1.default.basename(safeFileName, extension) || "progress-file";
    const storedFileName = `${Date.now()}-${(0, crypto_1.randomUUID)()}-${baseName}${extension}`;
    await fs_1.promises.mkdir(PROJECT_PROGRESS_UPLOAD_DIR, { recursive: true });
    const absolutePath = path_1.default.join(PROJECT_PROGRESS_UPLOAD_DIR, storedFileName);
    await fs_1.promises.writeFile(absolutePath, buffer);
    return {
        fileName: payload.fileName,
        fileUrl: `/uploads/project-progress/${storedFileName}`,
        fileMimeType: payload.fileMimeType,
        fileSize: buffer.length,
        absolutePath,
    };
};
const removeStoredFile = async (fileUrl) => {
    if (!fileUrl)
        return;
    const relativePath = fileUrl.replace(/^\/+/, "");
    const absolutePath = path_1.default.resolve(process.cwd(), relativePath);
    try {
        await fs_1.promises.unlink(absolutePath);
    }
    catch {
        // Ignore missing files during cleanup.
    }
};
const getAllocationIssueCode = async (transaction) => {
    const activeGuides = await guide_model_1.Guide.findAll({
        where: { isActive: true },
        attributes: ["id", "maxProjects"],
        transaction,
    });
    if (!activeGuides.length) {
        return "noActiveGuides";
    }
    for (const guide of activeGuides) {
        const maxProjects = guide.maxProjects ?? 0;
        if (maxProjects <= 0) {
            continue;
        }
        const assignedProjects = await project_model_1.Project.count({
            where: { guideId: guide.id },
            transaction,
        });
        if (assignedProjects < maxProjects) {
            return "noGuideAvailable";
        }
    }
    return "noCapacity";
};
const buildAllocationIssue = (code) => ({
    code,
    message: PROJECT_ALLOCATION_ISSUE_MESSAGES[code],
});
const normalizeProjectPhaseStatuses = (phaseStatuses) => {
    const defaults = (0, project_model_2.buildDefaultProjectPhaseStatuses)();
    if (!Array.isArray(phaseStatuses)) {
        return defaults;
    }
    const existingStatuses = new Map();
    for (const entry of phaseStatuses) {
        if (entry &&
            typeof entry === "object" &&
            "phase" in entry &&
            "status" in entry &&
            typeof entry.phase === "string" &&
            (entry.status === "pending" ||
                entry.status === "in_progress" ||
                entry.status === "completed")) {
            existingStatuses.set(entry.phase, entry.status);
        }
    }
    return defaults.map((entry) => ({
        phase: entry.phase,
        status: existingStatuses.get(entry.phase) ?? entry.status,
    }));
};
const getProjectPhaseStatus = (project, phase) => {
    const currentStatuses = normalizeProjectPhaseStatuses(project.phaseStatuses);
    return currentStatuses.find((entry) => entry.phase === phase)?.status ?? "pending";
};
const setProjectPhaseStatus = async (project, phase, status, transaction) => {
    const currentStatuses = normalizeProjectPhaseStatuses(project.phaseStatuses);
    project.phaseStatuses = currentStatuses.map((entry) => entry.phase === phase ? { ...entry, status } : entry);
    await project.save({ transaction });
};
const recalculateProjectPhaseStatusAfterProgressDelete = async (project, phase, transaction) => {
    const remainingProgress = await projectProgress_model_1.ProjectProgress.findAll({
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
    const hasCompleted = remainingProgress.some((entry) => entry.remarkStatus === "completed");
    await setProjectPhaseStatus(project, phase, hasCompleted ? "completed" : "in_progress", transaction);
};
const getProjectWithRelations = async (projectId, transaction) => project_model_1.Project.findByPk(projectId, {
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
const canStudentAccessProject = async (projectId, studentId, transaction) => {
    const project = await project_model_1.Project.findByPk(projectId, { transaction });
    if (!project) {
        throw new Error("Project not found.");
    }
    if (project.studentId === studentId) {
        return project;
    }
    const membership = await projectMember_model_1.ProjectMember.findOne({
        where: { projectId, studentId },
        transaction,
    });
    if (!membership) {
        throw new Error("You are not allowed to access this project.");
    }
    return project;
};
const assertGuideOwnsProject = async (projectId, authUser, transaction) => {
    const guide = await (0, guide_service_1.getGuideProfileByUser)(authUser);
    if (!guide) {
        throw new Error("Guide profile not found for the logged-in user.");
    }
    const project = await project_model_1.Project.findByPk(projectId, { transaction });
    if (!project) {
        throw new Error("Project not found.");
    }
    if (project.guideId !== guide.id) {
        throw new Error("You are not allowed to access this project.");
    }
    return { project, guide };
};
const getProjectStatusSummary = (project) => {
    const phaseStatuses = normalizeProjectPhaseStatuses(project.phaseStatuses);
    const firstOpenPhase = phaseStatuses.find((entry) => entry.status !== "completed");
    if (!firstOpenPhase) {
        return {
            currentPhase: "Completed",
            currentPhaseStatus: "completed",
        };
    }
    return {
        currentPhase: firstOpenPhase.phase,
        currentPhaseStatus: firstOpenPhase.status,
    };
};
const enrichProjectAllocationState = async (project, transaction) => {
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
const createProjectService = async (studentId, payload) => {
    const memberIds = [...new Set(payload.projectMembers)];
    if (memberIds.length !== payload.projectMembers.length) {
        throw new Error("A student has already been added to this project. Please select a different student.");
    }
    if (memberIds.includes(studentId)) {
        throw new Error("You cannot add yourself as a project member");
    }
    return database_1.sequelize.transaction(async (transaction) => {
        const preferredGuide = await guide_model_1.Guide.findOne({
            where: { id: payload.preferredGuideId, isActive: true },
            attributes: ["id"],
            transaction,
        });
        if (!preferredGuide) {
            throw new Error("Selected preferred guide is invalid or inactive.");
        }
        const [existingCreatorProject, existingCreatorAsMember] = await Promise.all([
            project_model_1.Project.findOne({ where: { studentId }, transaction }),
            projectMember_model_1.ProjectMember.findOne({ where: { studentId }, transaction }),
        ]);
        if (existingCreatorProject || existingCreatorAsMember) {
            throw new Error("You are already assigned to a project.");
        }
        const creator = await user_models_1.User.findOne({
            where: { id: studentId, role: "student" },
            attributes: ["id", "class", "division"],
            transaction,
        });
        if (!creator) {
            throw new Error("Creator student profile not found.");
        }
        const creatorClass = creator.get("class");
        const creatorDivision = creator.get("division");
        if (!creatorClass || !creatorDivision) {
            throw new Error("Creator must have class and division set.");
        }
        const normalizedCreatorClass = normalizeAcademicValue(creatorClass);
        const normalizedCreatorDivision = normalizeAcademicValue(creatorDivision);
        const memberUsers = await user_models_1.User.findAll({
            where: { id: memberIds, role: "student" },
            attributes: ["id", "class", "division"],
            transaction,
        });
        const foundMemberIds = new Set(memberUsers.map((u) => u.get("id")));
        const missingOrInvalidMembers = memberIds.filter((id) => !foundMemberIds.has(id));
        if (missingOrInvalidMembers.length > 0) {
            throw new Error(`These member IDs are invalid or not student accounts: ${missingOrInvalidMembers.join(", ")}`);
        }
        const classDivisionMismatchIds = memberUsers
            .filter((member) => {
            const normalizedMemberClass = normalizeAcademicValue(member.get("class"));
            const normalizedMemberDivision = normalizeAcademicValue(member.get("division"));
            return (normalizedMemberClass !== normalizedCreatorClass ||
                normalizedMemberDivision !== normalizedCreatorDivision);
        })
            .map((member) => member.get("id"));
        if (classDivisionMismatchIds.length > 0) {
            throw new Error(`These students are not in your class/division`);
        }
        const [membersAlreadyCreators, membersAlreadyMembers] = await Promise.all([
            project_model_1.Project.findAll({
                where: { studentId: memberIds },
                attributes: ["studentId"],
                transaction,
            }),
            projectMember_model_1.ProjectMember.findAll({
                where: { studentId: memberIds },
                attributes: ["studentId"],
                transaction,
            }),
        ]);
        const occupiedStudentIds = new Set();
        for (const row of membersAlreadyCreators) {
            occupiedStudentIds.add(row.get("studentId"));
        }
        for (const row of membersAlreadyMembers) {
            occupiedStudentIds.add(row.get("studentId"));
        }
        if (occupiedStudentIds.size > 0) {
            throw new Error(`These students are already assigned to another project: ${[...occupiedStudentIds].join(", ")}`);
        }
        const project = await project_model_1.Project.create({
            title: payload.title,
            description: payload.description,
            technology: payload.technology,
            studentId,
            preferredGuideId: payload.preferredGuideId,
            phaseStatuses: (0, project_model_2.buildDefaultProjectPhaseStatuses)(),
        }, { transaction });
        const allocationResult = await (0, exports.autoAssignGuideToProject)(project.id, transaction);
        const membersData = memberIds.map((memberId) => ({
            projectId: project.id,
            studentId: memberId,
        }));
        await projectMember_model_1.ProjectMember.bulkCreate(membersData, { transaction });
        const createdProject = await getProjectWithRelations(project.id, transaction);
        const projectWithRelations = createdProject ?? project;
        if (allocationResult.allocationIssue) {
            return enrichProjectAllocationState(projectWithRelations, transaction);
        }
        return enrichProjectAllocationState(projectWithRelations, transaction);
    });
};
exports.createProjectService = createProjectService;
const getActiveGuidesService = async () => {
    return guide_model_1.Guide.findAll({
        where: { isActive: true },
        attributes: ["id", "fullName", "isActive"],
    });
};
exports.getActiveGuidesService = getActiveGuidesService;
const getStudentsService = async (currentStudentId) => {
    const students = await user_models_1.User.findAll({
        where: { role: "student" },
        attributes: ["id", "username"],
    });
    return students.sort((a) => (a.id === currentStudentId ? -1 : 1));
};
exports.getStudentsService = getStudentsService;
const getGuideProjectsService = async (authUser) => {
    const guide = await (0, guide_service_1.getGuideProfileByUser)(authUser);
    if (!guide) {
        throw new Error("Guide profile not found for the logged-in user.");
    }
    const projects = await project_model_1.Project.findAll({
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
exports.getGuideProjectsService = getGuideProjectsService;
const getMyProjectsService = async (studentId) => {
    const projects = await project_model_1.Project.findAll({
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
exports.getMyProjectsService = getMyProjectsService;
const getAdminOverviewService = async () => {
    const projects = await project_model_1.Project.findAll({
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
    const guides = await guide_model_1.Guide.findAll({
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
    const latestCompletedProgressByProjectId = new Map();
    const completedProgressUpdates = await projectProgress_model_1.ProjectProgress.findAll({
        where: { remarkStatus: "completed" },
        attributes: ["projectId", "reviewedAt", "updatedAt"],
        order: [["reviewedAt", "DESC"], ["updatedAt", "DESC"]],
    });
    for (const progress of completedProgressUpdates) {
        if (!latestCompletedProgressByProjectId.has(progress.projectId)) {
            latestCompletedProgressByProjectId.set(progress.projectId, (progress.reviewedAt ?? progress.updatedAt).toISOString());
        }
    }
    const students = await user_models_1.User.findAll({
        where: { role: "student" },
        attributes: ["id", "username", "given_name", "class", "division", "rollNumber"],
        order: [["username", "ASC"]],
    });
    const projectsByGuideId = new Map();
    const projectsByStudentId = new Map();
    for (const project of projects) {
        if (project.guideId) {
            projectsByGuideId.set(project.guideId, (projectsByGuideId.get(project.guideId) ?? 0) + 1);
        }
        if (project.studentId) {
            projectsByStudentId.set(project.studentId, (projectsByStudentId.get(project.studentId) ?? 0) + 1);
        }
        for (const member of project.members ?? []) {
            const memberId = member.id;
            projectsByStudentId.set(memberId, (projectsByStudentId.get(memberId) ?? 0) + 1);
        }
    }
    const guideActivity = guides.map((guide) => ({
        id: guide.id,
        fullName: guide.fullName,
        departmentName: guide.departmentName,
        username: guide.username,
        isActive: guide.isActive,
        maxProjects: guide.maxProjects,
        assignedProjects: projectsByGuideId.get(guide.id) ?? 0,
        remainingCapacity: Math.max((guide.maxProjects ?? 0) - (projectsByGuideId.get(guide.id) ?? 0), 0),
    }));
    const studentActivity = students.map((student) => ({
        id: student.id,
        username: student.username,
        fullName: student.given_name,
        class: student.get("class"),
        division: student.get("division"),
        rollNumber: student.get("rollNumber"),
        projectCount: projectsByStudentId.get(student.id) ?? 0,
        isAssigned: (projectsByStudentId.get(student.id) ?? 0) > 0,
    }));
    const projectsWithAllocationState = await Promise.all(projects.map(async (project) => {
        const enrichedProject = await enrichProjectAllocationState(project);
        const statusSummary = getProjectStatusSummary(enrichedProject);
        return {
            ...enrichedProject,
            currentPhase: statusSummary.currentPhase,
            currentPhaseStatus: statusSummary.currentPhaseStatus,
            completedAt: statusSummary.currentPhaseStatus === "completed"
                ? latestCompletedProgressByProjectId.get(enrichedProject.id) ?? null
                : null,
        };
    }));
    const allocationAlerts = projectsWithAllocationState
        .filter((project) => project.allocationIssue)
        .map((project) => ({
        projectId: project.id,
        projectTitle: project.title,
        issueCode: project.allocationIssue.code,
        message: project.allocationIssue.message,
        creatorName: project.creator?.given_name ||
            project.creator?.username ||
            `Student ${project.studentId}`,
        preferredGuideName: project.preferredGuide?.fullName ||
            project.preferredGuide?.fullname ||
            null,
    }));
    return {
        summary: {
            totalProjects: projectsWithAllocationState.length,
            allocatedProjects: projectsWithAllocationState.filter((project) => Boolean(project.guideId)).length,
            unallocatedProjects: projectsWithAllocationState.filter((project) => !project.guideId).length,
            totalGuideActivities: guideActivity.filter((guide) => guide.assignedProjects > 0).length,
            totalStudentActivities: studentActivity.filter((student) => student.projectCount > 0).length,
        },
        projects: projectsWithAllocationState,
        guideActivity,
        studentActivity,
        allocationAlerts,
    };
};
exports.getAdminOverviewService = getAdminOverviewService;
const deleteProjectService = async (projectId, authUser) => {
    return database_1.sequelize.transaction(async (transaction) => {
        const project = await project_model_1.Project.findByPk(projectId, { transaction });
        if (!project) {
            throw new Error("Project not found.");
        }
        if (authUser.role === "guide") {
            const guide = await (0, guide_service_1.getGuideProfileByUser)(authUser);
            if (!guide) {
                throw new Error("Guide profile not found for the logged-in user.");
            }
            if (project.guideId !== guide.id) {
                throw new Error("You can delete only projects assigned to you.");
            }
        }
        else if (authUser.role !== "admin") {
            throw new Error("You are not allowed to delete this project.");
        }
        const progressRows = await projectProgress_model_1.ProjectProgress.findAll({
            where: { projectId: project.id },
            transaction,
        });
        for (const progress of progressRows) {
            await removeStoredFile(progress.fileUrl);
        }
        await projectProgress_model_1.ProjectProgress.destroy({
            where: { projectId: project.id },
            transaction,
        });
        await projectMember_model_1.ProjectMember.destroy({
            where: { projectId: project.id },
            transaction,
        });
        await project.destroy({ transaction });
        return { id: projectId };
    });
};
exports.deleteProjectService = deleteProjectService;
const manuallyAssignGuideToProjectService = async (projectId, guideId) => {
    return database_1.sequelize.transaction(async (transaction) => {
        const project = await project_model_1.Project.findByPk(projectId, { transaction });
        if (!project) {
            throw new Error("Project not found.");
        }
        if (project.guideId) {
            throw new Error("Only pending projects can be manually allocated.");
        }
        const guide = await guide_model_1.Guide.findOne({
            where: { id: guideId, isActive: true },
            transaction,
        });
        if (!guide) {
            throw new Error("Selected guide is invalid or inactive.");
        }
        const currentAssignedProjects = await project_model_1.Project.count({
            where: { guideId: guide.id },
            transaction,
        });
        const currentMaxProjects = guide.maxProjects ?? 0;
        if (currentAssignedProjects >= currentMaxProjects) {
            guide.maxProjects = currentAssignedProjects + 1;
            await guide.save({ transaction });
        }
        project.guideId = guide.id;
        await project.save({ transaction });
        const updatedProject = await getProjectWithRelations(project.id, transaction);
        return enrichProjectAllocationState(updatedProject ?? project, transaction);
    });
};
exports.manuallyAssignGuideToProjectService = manuallyAssignGuideToProjectService;
const createProjectProgressService = async (projectId, authUser, payload) => {
    const attachment = await saveProgressAttachment(payload);
    try {
        return await database_1.sequelize.transaction(async (transaction) => {
            const project = await canStudentAccessProject(projectId, authUser.id, transaction);
            if (!project.guideId) {
                throw new Error("This project is not allocated to any guide yet.");
            }
            const assignedGuide = await guide_model_1.Guide.findByPk(project.guideId, {
                attributes: ["id", "isActive"],
                transaction,
            });
            if (!assignedGuide || !assignedGuide.isActive) {
                throw new Error("Progress cannot be submitted because the assigned guide is inactive. Please contact admin.");
            }
            if (getProjectPhaseStatus(project, payload.phase) === "completed") {
                throw new Error("Progress cannot be sent for a phase that is already completed.");
            }
            const existingNeedsChangesProgress = await projectProgress_model_1.ProjectProgress.findOne({
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
                return projectProgress_model_1.ProjectProgress.findByPk(existingNeedsChangesProgress.id, {
                    transaction,
                    include: [{ association: "student", attributes: ["id", "username", "given_name"] }],
                });
            }
            const progress = await projectProgress_model_1.ProjectProgress.create({
                projectId: project.id,
                studentId: authUser.id,
                phase: payload.phase,
                progressText: payload.progressText.trim(),
                fileName: attachment.fileName,
                fileUrl: attachment.fileUrl,
                fileMimeType: attachment.fileMimeType,
                fileSize: attachment.fileSize,
            }, { transaction });
            return projectProgress_model_1.ProjectProgress.findByPk(progress.id, {
                transaction,
                include: [{ association: "student", attributes: ["id", "username", "given_name"] }],
            });
        });
    }
    catch (error) {
        if (attachment.fileUrl) {
            await removeStoredFile(attachment.fileUrl);
        }
        throw error;
    }
};
exports.createProjectProgressService = createProjectProgressService;
const getProjectProgressService = async (projectId, authUser) => {
    if (authUser.role === "student") {
        await canStudentAccessProject(projectId, authUser.id);
    }
    else if (authUser.role === "guide") {
        await assertGuideOwnsProject(projectId, authUser);
    }
    else {
        const project = await project_model_1.Project.findByPk(projectId);
        if (!project) {
            throw new Error("Project not found.");
        }
    }
    return projectProgress_model_1.ProjectProgress.findAll({
        where: { projectId },
        include: [{ association: "student", attributes: ["id", "username", "given_name"] }],
        order: [["updatedAt", "DESC"], ["createdAt", "DESC"]],
    });
};
exports.getProjectProgressService = getProjectProgressService;
const reviewProjectProgressService = async (progressId, authUser, payload) => {
    return database_1.sequelize.transaction(async (transaction) => {
        const progress = await projectProgress_model_1.ProjectProgress.findByPk(progressId, { transaction });
        if (!progress) {
            throw new Error("Project progress not found.");
        }
        const { project } = await assertGuideOwnsProject(progress.projectId, authUser, transaction);
        progress.guideReply = payload.guideReply;
        progress.remarkStatus = payload.remarkStatus;
        progress.reviewedAt = new Date();
        await progress.save({ transaction });
        await setProjectPhaseStatus(project, progress.phase, payload.remarkStatus === "completed" ? "completed" : "in_progress", transaction);
        return projectProgress_model_1.ProjectProgress.findByPk(progress.id, {
            transaction,
            include: [{ association: "student", attributes: ["id", "username", "given_name"] }],
        });
    });
};
exports.reviewProjectProgressService = reviewProjectProgressService;
const deleteProjectProgressService = async (progressId, authUser) => {
    return database_1.sequelize.transaction(async (transaction) => {
        const progress = await projectProgress_model_1.ProjectProgress.findByPk(progressId, { transaction });
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
exports.deleteProjectProgressService = deleteProjectProgressService;
const autoAssignGuideToProject = async (projectId, transaction) => {
    const project = await project_model_1.Project.findByPk(projectId, { transaction });
    if (!project) {
        throw new Error("Project not found");
    }
    const technologiesText = project.technology || "";
    const preferredGuideId = project.preferredGuideId ?? null;
    const projectTechs = getProjectTechnologies(technologiesText);
    const guides = await guide_model_1.Guide.findAll({
        where: {
            isActive: true,
        },
        transaction,
    });
    const scoredGuides = [];
    for (const guide of guides) {
        const currentAssigned = await project_model_1.Project.count({
            where: {
                guideId: guide.id,
            },
            transaction,
        });
        const maxProjects = guide.maxProjects ?? 0;
        if (!maxProjects || currentAssigned >= maxProjects) {
            continue;
        }
        const normalizedExpertise = getNormalizedGuideExpertise(guide.expertise);
        let skillMatchCount = 0;
        for (const tech of projectTechs) {
            if (normalizedExpertise.includes(tech)) {
                skillMatchCount++;
            }
        }
        const skillScore = projectTechs.length > 0
            ? (skillMatchCount / projectTechs.length) * 70
            : 0;
        const preferredBonus = preferredGuideId && preferredGuideId === guide.id ? 20 : 0;
        const loadScore = maxProjects > 0
            ? ((maxProjects - currentAssigned) / maxProjects) * 10
            : 0;
        const totalScore = skillScore + preferredBonus + loadScore;
        if (totalScore <= 0)
            continue;
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
        if (b.score !== a.score)
            return b.score - a.score;
        if (a.currentAssigned !== b.currentAssigned)
            return a.currentAssigned - b.currentAssigned;
        return a.guide.id - b.guide.id;
    });
    const best = scoredGuides[0].guide;
    project.guideId = best.id;
    await project.save({ transaction });
    return {
        project,
        assignedGuide: best,
        allocationIssue: null,
    };
};
exports.autoAssignGuideToProject = autoAssignGuideToProject;
