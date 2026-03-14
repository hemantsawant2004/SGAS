"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoAssignGuideToProject = exports.manuallyAssignGuideToProjectService = exports.deleteProjectService = exports.getAdminOverviewService = exports.getMyProjectsService = exports.getGuideProjectsService = exports.getStudentsService = exports.getActiveGuidesService = exports.createProjectService = void 0;
const project_model_1 = require("./project.model");
const projectMember_model_1 = require("./projectMember.model");
const user_models_1 = require("../user/user.models");
const guide_model_1 = require("../Guide/guide.model");
const guide_service_1 = require("../Guide/guide.service");
const database_1 = require("../../config/database");
const NORMALIZE_CLASS_DIVISION = true;
const PROJECT_ALLOCATION_ISSUE_MESSAGES = {
    noActiveGuides: "No active guides are available for allocation. Admin review is required.",
    noCapacity: "All active guides have reached maximum capacity. Admin review is required.",
    noGuideAvailable: "No guide is currently available for automatic allocation. Admin review is required.",
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
        throw new Error("Duplicate students are not allowed in project members.");
    }
    if (memberIds.includes(studentId)) {
        throw new Error("Project creator should not be added in project members list.");
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
            throw new Error(`These students are not in creator's class/division: ${classDivisionMismatchIds.join(", ")}`);
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
        // ✅ Create project inside transaction
        const project = await project_model_1.Project.create({
            title: payload.title,
            description: payload.description,
            technology: payload.technology, // ✅ matches autoAssign
            studentId,
            preferredGuideId: payload.preferredGuideId,
        }, { transaction });
        // ✅ Run auto allocation USING SAME TRANSACTION
        const allocationResult = await (0, exports.autoAssignGuideToProject)(project.id, transaction);
        // ✅ Create group members
        const membersData = memberIds.map((memberId) => ({
            projectId: project.id,
            studentId: memberId,
        }));
        await projectMember_model_1.ProjectMember.bulkCreate(membersData, { transaction });
        const createdProject = await project_model_1.Project.findByPk(project.id, {
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
exports.createProjectService = createProjectService;
const getActiveGuidesService = async () => {
    return guide_model_1.Guide.findAll({
        where: { isActive: true },
        attributes: ["id", "fullName"],
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
exports.getGuideProjectsService = getGuideProjectsService;
const getMyProjectsService = async (studentId) => {
    const projects = await project_model_1.Project.findAll({
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
        order: [["createdAt", "DESC"]],
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
    const projectsWithAllocationState = await Promise.all(projects.map((project) => enrichProjectAllocationState(project)));
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
        const updatedProject = await project_model_1.Project.findByPk(project.id, {
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
exports.manuallyAssignGuideToProjectService = manuallyAssignGuideToProjectService;
const autoAssignGuideToProject = async (projectId, transaction) => {
    // 1. Get project (inside same transaction if passed)
    const project = await project_model_1.Project.findByPk(projectId, { transaction });
    if (!project) {
        throw new Error("Project not found");
    }
    // project.technology -> "html, css, js"
    const technologiesText = project.technology || "";
    const preferredGuideId = project.preferredGuideId ?? null;
    const projectTechs = getProjectTechnologies(technologiesText);
    // 2. Get all active guides
    const guides = await guide_model_1.Guide.findAll({
        where: {
            isActive: true,
        },
        transaction,
    });
    const scoredGuides = [];
    // 3. Evaluate each guide
    for (const guide of guides) {
        // Count how many projects already assigned to this guide
        const currentAssigned = await project_model_1.Project.count({
            where: {
                guideId: guide.id, // ✅ use assigned guide, not preferredGuideId
            },
            transaction,
        });
        // Skip guide if at or above maxProjects
        const maxProjects = guide.maxProjects ?? 0;
        if (!maxProjects || currentAssigned >= maxProjects) {
            continue;
        }
        // Parse expertise array
        const normalizedExpertise = getNormalizedGuideExpertise(guide.expertise);
        // Skill match
        let skillMatchCount = 0;
        for (const tech of projectTechs) {
            if (normalizedExpertise.includes(tech)) {
                skillMatchCount++;
            }
        }
        const skillScore = projectTechs.length > 0
            ? (skillMatchCount / projectTechs.length) * 70
            : 0;
        // Preferred guide bonus
        const preferredBonus = preferredGuideId && preferredGuideId === guide.id ? 20 : 0;
        // Load factor (more free capacity = better)
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
    // 4. Pick best guide
    scoredGuides.sort((a, b) => {
        if (b.score !== a.score)
            return b.score - a.score;
        if (a.currentAssigned !== b.currentAssigned)
            return a.currentAssigned - b.currentAssigned;
        return a.guide.id - b.guide.id;
    });
    const best = scoredGuides[0].guide;
    // 5. Assign guide to project
    project.guideId = best.id; // ✅ make sure you have guideId column in projects table
    await project.save({ transaction });
    return {
        project,
        assignedGuide: best,
        allocationIssue: null,
    };
};
exports.autoAssignGuideToProject = autoAssignGuideToProject;
