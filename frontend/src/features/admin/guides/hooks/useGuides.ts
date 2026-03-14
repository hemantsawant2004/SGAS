import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGuides } from "../services/guides.service";
import {
  deactivateGuide,
  reactivateGuide,
  updateAllGuidesMaxProjects,
  updateGuideMaxProjects,
} from "../services/guides.service";

export const useGuides = () => {
  return useQuery({
    queryKey: ["guides"],
    queryFn: fetchGuides,
  });
};

export const useDeleteGuide = () => {
  const queryclient = useQueryClient();

  return useMutation({
    mutationFn: deactivateGuide,
    onSuccess:()=>{
      queryclient.invalidateQueries({queryKey:["guides"]});
    },
  });
};

export const useReactivateGuide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });
};

export const useUpdateGuideMaxProjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, maxProjects }: { id: number; maxProjects: number }) =>
      updateGuideMaxProjects(id, maxProjects),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });
};

export const useUpdateAllGuidesMaxProjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (maxProjects: number) => updateAllGuidesMaxProjects(maxProjects),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guides"] });
    },
  });
};
