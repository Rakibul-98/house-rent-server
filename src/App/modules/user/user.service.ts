import { TUser } from "./user.interface";
import { UserModel } from "./user.models";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import Jwt,{ JwtPayload } from "jsonwebtoken";
import config from "../../config";

const createUserIntoDB = async (user: TUser) => {

  // Create the new user in the database
  const newUser = await UserModel.create(user);

  if (!newUser) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create user");
  }

  // Prepare JWT payload
  const jwtPayload = {
    email: newUser.email,
    role: newUser.role,
    user_name: newUser.user_name,
    phone_num: newUser.phone_num,
    profile_image: newUser.profile_image,
    isBlocked: newUser.isBlocked,
    isDeleted: newUser.isDeleted
  };

  // Generate access token
  const token = Jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "2d", // Token expires in 2 days
  });

  // Generate refresh token
  const refreshToken = Jwt.sign(jwtPayload, config.jwt_refresh_secret as string, {
    expiresIn: "365d", // Refresh token expires in 1 year
  });

  // Return the new user and tokens
  return {
    user: newUser,
    token,
    refreshToken,
  };
};

const getAllUsersFromDB = async () => {
  const users = await UserModel.find();
  return users;
};

const getSingleUserFromDB = async (email: string, loggedInUser: JwtPayload) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // checking if the actual user try to get the data
  if (loggedInUser.role !== "admin" && email !== loggedInUser.email) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view other user’s details"
    );
  }
  return user;
};

const blockUserIntoDB = async (_id: string) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    { _id },
    { isBlocked: true },
    { new: true }
  );
  return updatedUser;
};


const updateUserIntoDB = async (
  user_name: string,
  profile_image: string,
  phone_num: string,
  payload: JwtPayload
) => {
  const _id = payload._id;
  const user = await UserModel.findById({_id});

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Ensure the user can only update their own profile
  if (user._id.toString() !== payload._id.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update another user’s details"
    );
  }

  const result = await UserModel.findByIdAndUpdate(
    _id,
    {
      user_name,
      profile_image,
      phone_num,
      updatedAt: new Date(),
    },
    {
      new: true,
    }
  ).select("-password -__v");

  return result;
};

const updateUserRoleIntoDB = async (_id: string, role: string) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    { _id },
    { role },
    { new: true }
  );
  return updatedUser;
};

export const userServices = {
  createUserIntoDB,
  blockUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  updateUserRoleIntoDB,
};
