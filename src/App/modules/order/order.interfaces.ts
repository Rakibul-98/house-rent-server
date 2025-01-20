import { Types } from "mongoose";

export type orderType = {
    email: string,
    product: Types.ObjectId;
    quantity: number,
    totalPrice: number,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
}