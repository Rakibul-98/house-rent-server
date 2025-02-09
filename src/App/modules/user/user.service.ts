import { TUser } from "./user.interface";
import { UserModel } from "./user.models";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";

const createUserIntoDB = async (user: TUser) => {
  const newUser = await UserModel.create(user);
  return newUser;
};

const getAllUsersFromDB = async () => {
  const users = await UserModel.find();
  return users;
};

const getSingleUserFromDB = async (email: string, userEmail: string) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // checking if the actual user try to get the data
  if (email !== userEmail) {
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
  _id: string,
  user_name: string,
  profile_image: string,
  payload: JwtPayload
) => {
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
      updatedAt: new Date(),
    },
    {
      new: true,
    }
  ).select("-password -__v");

  return result;
};

export const userServices = {
  createUserIntoDB,
  blockUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
};
