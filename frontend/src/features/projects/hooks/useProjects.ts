import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchGuideProjects,
  fetchMyProjects,
  fetchProjectGuides,
  fetchSelectableStudents,
  submitProject,
  type CreateProjectPayload,
} from "../services/projects.service";

export function useProjectGuides() {
  return useQuery({
    queryKey: ["project-guides"],
    queryFn: fetchProjectGuides,
  });
}

export function useSelectableStudents() {
  return useQuery({
    queryKey: ["project-students"],
    queryFn: fetchSelectableStudents,
  });
}

export function useSubmitProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => submitProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-projects"] });
      queryClient.invalidateQueries({ queryKey: ["guide-projects"] });
    },
  });
}

export function useMyProjects() {
  return useQuery({
    queryKey: ["student-projects"],
    queryFn: fetchMyProjects,
  });
}

export function useGuideProjects() {
  return useQuery({
    queryKey: ["guide-projects"],
    queryFn: fetchGuideProjects,
  });
}
