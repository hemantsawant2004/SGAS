import { useMutation } from "@tanstack/react-query";
// import { createGuideProfile } from "../services/guideService";
// import { CreateGuideProfileDto } from "../types/guide.dto";
import { createGuideProfile } from "../services/guide.service";
import type{ CreateGuideProfileDto } from "../dto/guide.dto";
import { useNavigate } from "react-router-dom";

export const useCreateGuideProfile = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateGuideProfileDto) =>
      createGuideProfile(data),

    onSuccess: () => {
      navigate("/guide/dashboard");
    },
  });
};