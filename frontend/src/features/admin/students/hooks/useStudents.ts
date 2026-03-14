import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteStudent,
  fetchStudents,
  updateStudent,
} from "../services/students.service";

const STUDENTS_QUERY_KEY = ["admin-students"];

export function useStudents() {
  return useQuery({
    queryKey: STUDENTS_QUERY_KEY,
    queryFn: fetchStudents,
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { username: string; given_name?: string | null };
    }) => updateStudent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
}
