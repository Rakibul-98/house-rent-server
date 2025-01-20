import { orderType } from './order.interfaces';
import { model, Schema } from "mongoose";


const orderSchema: Schema<orderType> = new Schema <orderType>({
    email: {
        type: String,
        required: true,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Bike",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
    },
    isDeleted: {
        type: Boolean
    }
});

export const OrderModel = model<orderType>('Order', orderSchema);