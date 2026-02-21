// import { CreateGuideProfileDto, GuideProfileResponse } from "../types/guide.dto";
import type{ CreateGuideProfileDto, GuideProfileResponse } from "../dto/guide.dto";
import { api } from "../../../app/config/axios.config";

export const createGuideProfile = async (
  data: CreateGuideProfileDto
): Promise<GuideProfileResponse> => {
  const response = await api.post("/guides/profile", data);
  return response.data?.data;
};

export const getMyGuideProfile = async (): Promise<GuideProfileResponse> => {
  const response = await api.get("/guides/profile/me");
  return response.data?.data;
};

export const updateMyGuideProfile = async (
  data: CreateGuideProfileDto
): Promise<GuideProfileResponse> => {
  const response = await api.patch("/guides/profile/me", data);
  return response.data?.data;
};
