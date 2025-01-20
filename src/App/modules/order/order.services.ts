import { orderType } from "./order.interfaces";
import { OrderModel } from "./order.models";


const createOrderIntoDB = async (order: orderType) =>{
    return await OrderModel.create(order);
}

const getOrderRevenueFromDB = async () =>{
    const result = await OrderModel.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalPrice" }
            }
        },
        {
            $project: {
                _id: 0,
                totalRevenue: 1
            }
        }
    ]);
    return result.length > 0 ? result[0] : 0;
} 

export const OrderServices = {
    createOrderIntoDB,
    getOrderRevenueFromDB
}