import { api } from "../../../../app/config/axios.config";

export interface AdminGuide {
  id: number;
  fullname?: string;
  fullName?: string;
  departmentName?: string;
  experience?: number;
  expertise?: string[] | string;
  isActive?: boolean;
  maxProjects?: number;
  email?: string;
}

export const fetchGuides = async (): Promise<AdminGuide[]> => {
  const res = await api.get("/admin-guides");
  return res.data?.data ?? [];
};

export const deactivateGuide = async (id: number) => {
  return api.patch(`/admin-guides/${id}/deactivate`);
};

export const reactivateGuide = async (id: number) => {
  return api.patch(`/admin-guides/${id}/reactivate`);
};

export const updateGuideMaxProjects = async (id: number, maxProjects: number) => {
  return api.patch(`/admin-guides/${id}/max-projects`, { maxProjects });
};

export const updateAllGuidesMaxProjects = async (maxProjects: number) => {
  return api.patch("/admin-guides/max-projects", { maxProjects });
};


