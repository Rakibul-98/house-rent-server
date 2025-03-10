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
    email: existingUser.email,
    role: existingUser.role,
    user_name: existingUser.user_name,
    phone_num: existingUser.phone_num,
    profile_image: existingUser.profile_image,
    isBlocked: existingUser.isBlocked,
    isDeleted: existingUser.isDeleted
  };

  // generate access token with JWT
  const token = Jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "2d",
  });

  const refreshToken = Jwt.sign(
    jwtPayload,
    config.jwt_refresh_secret as string,
    {
      expiresIn: "365d",
    }
  );

  return {
    token,
    refreshToken,
  };
};

const refreshToken = async (refToken: string) => {
  // checking if the given token is valid
  const decoded = Jwt.verify(
    refToken,
    config.jwt_refresh_secret as string
  ) as JwtPayload;

  const { user, iat } = decoded;

  // checking if the user is exist
  const userExists = await UserModel.isUserExistsByEmail(user);

  if (!userExists) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
  }
  // checking if the user is already deleted
  const isDeleted = userExists?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  // checking if the user is blocked
  const userStatus = userExists?.isBlocked;

  if (userStatus === true) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  // if (
  //   userExists.passwordChangedAt &&
  //   UserModel.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  // ) {
  //   throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
  // }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const token = Jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "2d",
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
  refreshToken,
};
