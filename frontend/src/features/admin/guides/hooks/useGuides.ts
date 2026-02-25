import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGuides } from "../services/guides.service";
import { deleteGuide } from "../services/guides.service";
import { reactivateGuide } from "../services/guides.service";

export const useGuides = () => {
  return useQuery({
    queryKey: ["guides"],
    queryFn: fetchGuides,
  });
};

export const useDeleteGuide = () => {
  const queryclient = useQueryClient();

  return useMutation({
    mutationFn:deleteGuide,
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