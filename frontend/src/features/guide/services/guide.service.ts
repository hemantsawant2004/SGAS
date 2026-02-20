// import { CreateGuideProfileDto, GuideProfileResponse } from "../types/guide.dto";
import type{ CreateGuideProfileDto, GuideProfileResponse } from "../dto/guide.dto";
import { api } from "../../../app/config/axios.config";

export const createGuideProfile = async (
  data: CreateGuideProfileDto
): Promise<GuideProfileResponse> => {
  const response = await api.post("/guide/profile", data);
  return response.data;
};