import { api } from "../../../app/config/axios.config";

export type ProjectPhaseName =
  | "intro"
  | "system analysis"
  | "system design"
  | "reports"
  | "rough documentation"
  | "final submission";

export type ProjectPhaseStatus = "pending" | "in_progress" | "completed";

export interface ProjectPhaseEntry {
  phase: ProjectPhaseName;
  status: ProjectPhaseStatus;
}

export interface ProjectPerson {
  id: number;
  username: string;
  given_name?: string;
  class?: string;
  division?: string;
}

export interface ProjectGuideOption {
  id: number;
  fullName?: string;
  fullname?: string;
  isActive?: boolean;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  technology: string;
  phaseStatuses?: ProjectPhaseEntry[];
  creator?: ProjectPerson;
  preferredGuide?: ProjectGuideOption | null;
  assignedGuide?: ProjectGuideOption | null;
  members?: ProjectPerson[];
  createdAt?: string;
  updatedAt?: string;
  currentPhase?: string;
  currentPhaseStatus?: ProjectPhaseStatus;
  completedAt?: string | null;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  technology: string;
  projectMembers: number[];
  preferredGuideId: number;
}

export interface ProjectProgress {
  id: number;
  projectId: number;
  studentId: number;
  phase: ProjectPhaseName;
  progressText: string;
  guideReply?: string | null;
  remarkStatus: "pending" | "needs_changes" | "completed";
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  fileName?: string | null;
  fileUrl?: string | null;
  fileMimeType?: string | null;
  fileSize?: number | null;
  student?: ProjectPerson;
}

export interface CreateProjectProgressPayload {
  phase: ProjectPhaseName;
  progressText?: string;
  fileBase64?: string;
  fileName?: string;
  fileMimeType?: string;
}

export interface ReviewProjectProgressPayload {
  guideReply: string;
  remarkStatus: "needs_changes" | "completed";
}

export const PROJECT_PHASES: ProjectPhaseName[] = [
  "intro",
  "system analysis",
  "system design",
  "reports",
  "rough documentation",
  "final submission",
];

export async function fetchProjectGuides(): Promise<ProjectGuideOption[]> {
  const { data } = await api.get("/projects/guides");
  return data?.data ?? [];
}

export async function fetchSelectableStudents(): Promise<ProjectPerson[]> {
  const { data } = await api.get("/projects/students");
  return data?.data ?? [];
}

export async function submitProject(payload: CreateProjectPayload): Promise<Project> {
  const { data } = await api.post("/projects", payload);
  return data?.data;
}

export async function fetchMyProjects(): Promise<Project[]> {
  const { data } = await api.get("/projects/my-projects");
  return data?.data ?? [];
}

export async function fetchGuideProjects(): Promise<Project[]> {
  const { data } = await api.get("/projects/guide-projects");
  return data?.data ?? [];
}

export async function fetchProjectProgress(projectId: number): Promise<ProjectProgress[]> {
  const { data } = await api.get(`/projects/${projectId}/progress`);
  return data?.data ?? [];
}

export async function createProjectProgress(
  projectId: number,
  payload: CreateProjectProgressPayload
): Promise<ProjectProgress> {
  const { data } = await api.post(`/projects/${projectId}/progress`, payload);
  return data?.data;
}

export async function deleteProjectProgress(progressId: number): Promise<{ id: number }> {
  const { data } = await api.delete(`/projects/progress/${progressId}`);
  return data?.data;
}

export async function reviewProjectProgress(
  progressId: number,
  payload: ReviewProjectProgressPayload
): Promise<ProjectProgress> {
  const { data } = await api.patch(`/projects/progress/${progressId}/review`, payload);
  return data?.data;
}




