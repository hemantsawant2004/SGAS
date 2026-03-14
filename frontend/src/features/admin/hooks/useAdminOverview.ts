import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../app/config/axios.config";
import {
  fetchAdminOverview,
  manuallyAssignGuideToProject,
} from "../services/adminOverview.service";

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchAdminOverview,
  });
}

export function useManualProjectGuideAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, guideId }: { projectId: number; guideId: number }) =>
      manuallyAssignGuideToProject(projectId, guideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      queryClient.invalidateQueries({ queryKey: ["guide-projects"] });
      queryClient.invalidateQueries({ queryKey: ["student-projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: number) => {
      const { data } = await api.delete(`/projects/${projectId}`);
      return data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["guides"] });
      queryClient.invalidateQueries({ queryKey: ["guide-projects"] });
      queryClient.invalidateQueries({ queryKey: ["student-projects"] });
    },
  });
}
