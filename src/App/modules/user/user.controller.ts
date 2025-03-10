import { userServices } from "./user.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import config from "../../config";

// user creation
const createUser = catchAsync(async (req, res) => {
  const userData = req.body;
  const result = await userServices.createUserIntoDB(userData);

  const { refreshToken, token } = result;
  
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.node_env === "production",
    });
  

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: {
      token,
    },
  });
});

// user blocking
const blockUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const result = await userServices.blockUserIntoDB(userId);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User blocked successfully",
    data: {},
  });
});

// fetching all users
const getAllUsers = catchAsync(async (req, res) => {
  const result = await userServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

// fetching single user by email
const getSingleUser = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await userServices.getSingleUserFromDB(email, req.user);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const { user_name, profile_image, phone_num } = req.body;

  const result = await userServices.updateUserIntoDB(
    user_name, profile_image, phone_num, req.user
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User data updated successfully",
    data: result,
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const {role} = req.body;

  const result = await userServices.updateUserRoleIntoDB(userId, role);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User role updated successfully",
    data: {},
  });
});

export const userControllers = {
  createUser,
  blockUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserRole,
};
