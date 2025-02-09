import { TUser } from "./user.interface";
import { UserModel } from "./user.models";
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';


const createUserIntoDB = async ( user:TUser)=>{
    const newUser = await UserModel.create(user);
    return newUser;
}

const blockUserIntoDB = async (_id: string) => {
    const updatedUser = await UserModel.findByIdAndUpdate(
        { _id },
        { isBlocked: true },
        { new: true }
    );
    return updatedUser;
};

const getAllUsersFromDB = async ()=>{
    const users = await UserModel.find();
    return users;
}

const getSingleUserFromDB = async (email: string, userEmail: string)=>{

    const user = await UserModel.findOne({email});

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND,'User not found');
    }

    // checking if the actual user try to get the data
    if (email !== userEmail) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to view other user’s details');
      }
    return user;
}

export const userServices = {
    createUserIntoDB,
    blockUserIntoDB,
    getAllUsersFromDB,
    getSingleUserFromDB,
 
}