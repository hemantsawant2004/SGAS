import { api } from "../../../app/config/axios.config";
import type { Project } from "../../projects/services/projects.service";

export interface AdminGuideActivity {
  id: number;
  fullName: string;
  departmentName: string;
  username: string;
  isActive: boolean;
  maxProjects: number;
  assignedProjects: number;
  remainingCapacity: number;
}

export interface AdminStudentActivity {
  id: number;
  username: string;
  fullName: string;
  class?: string;
  division?: string;
  rollNumber?: string;
  projectCount: number;
  isAssigned: boolean;
}

export interface AdminAllocationAlert {
  projectId: number;
  projectTitle: string;
  issueCode: string;
  message: string;
  creatorName: string;
  preferredGuideName: string | null;
}

export interface AdminOverview {
  summary: {
    totalProjects: number;
    allocatedProjects: number;
    unallocatedProjects: number;
    totalGuideActivities: number;
    totalStudentActivities: number;
  };
  projects: Project[];
  guideActivity: AdminGuideActivity[];
  studentActivity: AdminStudentActivity[];
  allocationAlerts: AdminAllocationAlert[];
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const { data } = await api.get("/projects/admin-overview");
  return data?.data;
}

export async function manuallyAssignGuideToProject(
  projectId: number,
  guideId: number
): Promise<Project> {
  const { data } = await api.patch(`/projects/${projectId}/assign-guide`, { guideId });
  return data?.data;
}
