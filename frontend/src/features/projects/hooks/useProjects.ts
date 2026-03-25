import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProjectProgress,
  deleteProjectProgress,
  fetchGuideProjects,
  fetchMyProjects,
  fetchProjectGuides,
  fetchProjectProgress,
  fetchProjectTrackingByCode,
  fetchSelectableStudents,
  reviewProjectProgress,
  submitProject,
  type CreateProjectPayload,
  type CreateProjectProgressPayload,
  type ReviewProjectProgressPayload,
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

export function useProjectProgress(projectId: number, enabled = true) {
  return useQuery({
    queryKey: ["project-progress", projectId],
    queryFn: () => fetchProjectProgress(projectId),
    enabled: enabled && Number.isFinite(projectId) && projectId > 0,
  });
}

export function useProjectTracking(projectCode: string) {
  return useQuery({
    queryKey: ["project-tracking", projectCode],
    queryFn: () => fetchProjectTrackingByCode(projectCode),
    enabled: projectCode.trim().length > 0,
    retry: false,
  });
}

export function useCreateProjectProgress(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectProgressPayload) =>
      createProjectProgress(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-progress", projectId] });
      queryClient.invalidateQueries({ queryKey: ["student-projects"] });
      queryClient.invalidateQueries({ queryKey: ["guide-projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
}

export function useReviewProjectProgress(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      progressId,
      payload,
    }: {
      progressId: number;
      payload: ReviewProjectProgressPayload;
    }) => reviewProjectProgress(progressId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-progress", projectId] });
      queryClient.invalidateQueries({ queryKey: ["student-projects"] });
      queryClient.invalidateQueries({ queryKey: ["guide-projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
}

export function useDeleteProjectProgress(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (progressId: number) => deleteProjectProgress(progressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-progress", projectId] });
      queryClient.invalidateQueries({ queryKey: ["student-projects"] });
      queryClient.invalidateQueries({ queryKey: ["guide-projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
}
