import { api } from "../../../app/config/axios.config";

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
}

export interface Project {
  id: number;
  title: string;
  description: string;
  technology: string;
  creator?: ProjectPerson;
  preferredGuide?: ProjectGuideOption | null;
  assignedGuide?: ProjectGuideOption | null;
  members?: ProjectPerson[];
  createdAt?: string;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  technology: string;
  projectMembers: number[];
  preferredGuideId: number;
}

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
