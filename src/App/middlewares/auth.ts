import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/AppError";
import { UserModel } from "../modules/user/user.models";

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;

    // check the token sent or not
    if (!accessToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    // validate the token
    let decoded;
    try {
      decoded = jwt.verify(
        accessToken,
        config.jwt_access_secret as string
      ) as JwtPayload;
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token!");
    }

    // get logged in user
    const loggedInUser = await UserModel.findOne({ email: decoded.email });
    if (!loggedInUser) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not found!");
    }

    // differentiated and secured roles
    if (requiredRoles && !requiredRoles.includes(decoded.role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access!");
    }

    req.user = loggedInUser;
    next();
  });
};

export default auth;
