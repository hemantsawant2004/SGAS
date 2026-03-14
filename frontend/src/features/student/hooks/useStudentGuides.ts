import { useQuery } from "@tanstack/react-query";
import { fetchStudentGuides } from "../services/studentGuides.service";

export function useStudentGuides() {
  return useQuery({
    queryKey: ["student-guides"],
    queryFn: fetchStudentGuides,
  });
}
