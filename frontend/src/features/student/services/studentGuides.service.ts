import { api } from "../../../app/config/axios.config";

export interface StudentGuide {
  id: number;
  fullname?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  linkedin?: string | null;
  bio?: string;
  departmentName?: string;
  qualification?: string;
  experience?: number;
  expertise?: string[] | string;
  isActive?: boolean;
  maxProjects?: number;
  username?: string;
  createdAt?: string;
}

export async function fetchStudentGuides(): Promise<StudentGuide[]> {
  const { data } = await api.get("/student-guides");
  return data?.data ?? [];
}
