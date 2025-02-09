import { Types } from "mongoose";

export type orderType = {
    customer: Types.ObjectId;
    product: Types.ObjectId;
    quantity: number,
    totalPrice: number,
    orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned',
    isDeleted: boolean,
}