import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "../../../app/hooks";
import {
  createGuideProfile,
  getMyGuideProfile,
  updateMyGuideProfile,
} from "../services/guide.service";
import type{ CreateGuideProfileDto } from "../dto/guide.dto";
import { useNavigate } from "react-router-dom";


export const GUIDE_PROFILE_QUERY_KEY = ["guide-profile"];
export const getGuideProfileQueryKey = (username?: string) => [
  ...GUIDE_PROFILE_QUERY_KEY,
  username ?? "anonymous",
];

export const useCreateGuideProfile = (username?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  

  return useMutation({
    mutationFn: (data: CreateGuideProfileDto) =>
      createGuideProfile(data),

    onSuccess: () => {
      // alert(`Congrats {user?.username} Your Profile is created`)
      // confirm(`Congratulations ${User.username})`);
      queryClient.invalidateQueries({ queryKey: getGuideProfileQueryKey(username) });
      navigate("/guide/createprofile");
    },
  });
};

export const useMyGuideProfile = (username?: string) =>
  useQuery({
    queryKey: getGuideProfileQueryKey(username),
    queryFn: getMyGuideProfile,
    retry: false,
    enabled: Boolean(username),
    // staleTime: 1000 * 60 * 5,
  });

export const useUpdateGuideProfile = (username?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGuideProfileDto) => updateMyGuideProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGuideProfileQueryKey(username) });
    },
  });
};
