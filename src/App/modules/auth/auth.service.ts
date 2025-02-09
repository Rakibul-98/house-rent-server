import httpStatus from 'http-status';
import Jwt from 'jsonwebtoken';
import { UserModel } from "../user/user.models";
import { TLoginUser } from "./auth.interface";
import AppError from '../../errors/AppError';
import config from '../../config';


const loginUser = async (payload: TLoginUser) => {

    const existingUser = await UserModel.isUserExistsByEmail(payload.email);

    // checking if the user exists in the database
    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // checking if the user is blocked by the admin
    const isUserBlocked = existingUser.isBlocked;
    if (isUserBlocked) {
        throw new AppError(httpStatus.FORBIDDEN,'User is blocked');
    }

    // checking if the user is already deleted or not
    const isUserDeleted = existingUser.isDeleted;
    if (isUserDeleted) {
        throw new AppError(httpStatus.FORBIDDEN,'User is not available');
    }

    // checking if the password matches with the stored password
    if (! await UserModel.isPasswordMatched(payload?.password, existingUser?.password)) {
        throw new AppError(httpStatus.UNAUTHORIZED,'Invalid credentials');
    }

    const jwtPayload = {
        user: existingUser.email,
        role: existingUser.role
    }

    // generate access token with JWT
    const token = Jwt.sign(
        jwtPayload,
        config.jwt_access_secret as string,
        { expiresIn: '10d' }
    )
    return {
        token
    };
}

export const authServices = {
    loginUser
}