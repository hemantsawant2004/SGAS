import { User } from "./user.models";
import type { CreateUserInput } from "./user.dto";

export async function findUserByUsername(username: string) {
  console.log("inside find user by username", username);

  return User.findOne({
    where: { username },
  });
}

export async function findUserById(id: number) {
  return User.findByPk(id);
}

export async function updateRefreshToken(
  userId: number,
  refresh_token_hash: string | null,
  refresh_token_expires_at: Date | null
) {
  console.log("inside clear refresh token", refresh_token_hash);
  console.log("userid", userId);
  console.log("refresh_token_expires_at", refresh_token_expires_at);

  return User.update(
    { refresh_token_hash, refresh_token_expires_at },
    { where: { id: userId } }
  );
}

/**
 * 
 * Create pre-registered user (without password)
 * Roles allowed: admin | guide | student
 */

export async function createPreUser(data: CreateUserInput) {
  return User.create({
    ...data,
    password: null,
  });
}

export async function updateUserPassword(
  userId: number,
  password: string
) {
  return User.update({ password }, { where: { id: userId } });
}
