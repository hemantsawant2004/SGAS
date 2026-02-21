import { Guide } from "./guide.model";
import { CreateGuideDto } from "./guide.dto";
import { AuthUser } from "../../types/express";

export const CreateGuideProfile = async (
  data: CreateGuideDto,
  user: AuthUser
) => {
  const existingByUser = await Guide.findOne({ where: { userId: user.id } });
  if (existingByUser) {
    throw new Error("Guide profile already exists for this user");
  }

  const existingByEmail = await Guide.findOne({ where: { email: data.email } });

  if (existingByEmail) {
    throw new Error("Guide already exists with this email");
  }

  return await Guide.create({ ...data, userId: user.id, username: user.username });
};

export const getGuideProfileByUser = async (user: AuthUser) => {
  const byUserId = await Guide.findOne({ where: { userId: user.id } });
  if (byUserId) return byUserId;

  const byUsername = await Guide.findOne({ where: { username: user.username } });
  if (byUsername) {
    await byUsername.update({ userId: user.id });
    return byUsername;
  }

  return null;
};

export const updateGuideProfileByUser = async (
  user: AuthUser,
  data: CreateGuideDto
) => {
  const guide = await getGuideProfileByUser(user);
  if (!guide) return null;

  const existingByEmail = await Guide.findOne({ where: { email: data.email } });
  if (existingByEmail && existingByEmail.get("id") !== guide.get("id")) {
    throw new Error("Guide already exists with this email");
  }

  await guide.update({ ...data, userId: user.id, username: user.username });
  return guide;
};
