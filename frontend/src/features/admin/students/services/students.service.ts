import { api } from "../../../../app/config/axios.config";

export interface AdminStudent {
  id: number;
  username: string;
  role: string;
  given_name?: string | null;
}

export async function fetchStudents(): Promise<AdminStudent[]> {
  const { data } = await api.get("/admin-students");
  return data?.data ?? [];
}

export async function updateStudent(
  id: number,
  payload: Pick<AdminStudent, "username" | "given_name">
) {
  const { data } = await api.patch(`/admin-students/${id}`, payload);
  return data?.data;
}

export async function deleteStudent(id: number) {
  const { data } = await api.delete(`/admin-students/${id}`);
  return data;
}
