import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authServices } from "./auth.service";
import config from "../../config";

// Login a user and return JWT token if successful.
const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body);
  const { refreshToken, token } = result;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.node_env === "production",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: {
      token,
    },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { newPassword, oldPassword } = req.body;
  const result = await authServices.changePasswordIntoDB(
    newPassword,
    oldPassword,
    req.user
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token retrieved successfully",
    data: result,
  });
});

export const authControllers = {
  loginUser,
  changePassword,
  refreshToken,
};
