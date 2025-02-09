import httpStatus from "http-status";
import Jwt, { JwtPayload } from "jsonwebtoken";
import { UserModel } from "../user/user.models";
import { TLoginUser } from "./auth.interface";
import AppError from "../../errors/AppError";
import config from "../../config";
import bcrypt from "bcrypt";

const loginUser = async (payload: TLoginUser) => {
  const existingUser = await UserModel.isUserExistsByEmail(payload.email);

  // checking if the user exists in the database
  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // checking if the user is blocked by the admin
  const isUserBlocked = existingUser.isBlocked;
  if (isUserBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
  }

  // checking if the user is already deleted or not
  const isUserDeleted = existingUser.isDeleted;
  if (isUserDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "User is not available");
  }

  // checking if the password matches with the stored password
  if (
    !(await UserModel.isPasswordMatched(
      payload?.password,
      existingUser?.password
    ))
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const jwtPayload = {
    user: existingUser.email,
    role: existingUser.role,
  };

  // generate access token with JWT
  const token = Jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "10d",
  });
  return {
    token,
  };
};

const changePasswordIntoDB = async (
  newPassword: string,
  oldPassword: string,
  payload: JwtPayload
) => {
  // Find user by email and select password
  const user = await UserModel.findOne({ email: payload.email }).select(
    "+password"
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Verify old password
  const isMatch = await UserModel.isPasswordMatched(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid password!");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  // Update password
  await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });
};

export const authServices = {
  loginUser,
  changePasswordIntoDB,
};
