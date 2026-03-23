import { User } from "./user.models";
import type { CreateUserInput } from "./user.dto";
import bcrypt from "bcrypt";
import { createAdminNotifications } from "../notifications/notification.service";

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
  if (data.role === "student") {
    const existingRollInSameClassDivision = await User.findOne({
      where: {
        role: "student",
        class: data.class,
        division: data.division,
        rollNumber: data.rollNumber,
      },
      attributes: ["id"],
    });

    if (existingRollInSameClassDivision) {
      throw new Error("Roll number already exists in this class and division.");
    }
  }

  const user = await User.create({
    username: data.username,
    given_name: data.given_name,
    role: data.role,
    class: data.role === "student" ? data.class : null,
    division: data.role === "student" ? data.division : null,
    rollNumber: data.role === "student" ? data.rollNumber : null,
    password: null,
  });

  if (data.role === "student") {
    await createAdminNotifications([
      {
        type: "student_created",
        title: "New student added",
        message: `${data.username} was added as a student account.`,
      },
    ]);
  }

  return user;
}

export async function updateUserPassword(
  userId: number,
  password: string
) {
  return User.update({ password }, { where: { id: userId } });
}
