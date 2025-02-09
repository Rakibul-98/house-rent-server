import { Request, Response } from "express";
import { ProductServices } from "../product/product.service";
import { OrderServices } from "./order.services";
import { orderZodSchema } from "./order.validators";


// create an order
const createOrder = async (req: Request, res: Response): Promise<any> => {
    try {
        // Get order data from client
        const { order } = req.body;
        // Validate order data with zod validation
        const zodParsedData = orderZodSchema.parse(order);
        // destructure value from order data
        const { product, quantity } = zodParsedData;

        // get the product from product bike collection
        const existingProduct = await ProductServices.getSingleBikeFromDB(product);

        // check the product exists or not
        if (!existingProduct) {
            return res.status(404).json({
                message: "Bike not found!!",
                success: false,
            });
        }

        // check if the product quantity is sufficient
        if (existingProduct.quantity < quantity) {
            return res.status(404).json({
                message: "Insufficient stock!",
                success: false,
            });
        }

        // calculate the total price of the order
        const totalPrice = quantity * existingProduct.price;

        // create the order in order collection
        const result = await OrderServices.createOrderIntoDB({
            ...order,
            totalPrice,
            createdAt: zodParsedData.createdAt ?? new Date(),
            updatedAt: zodParsedData.updatedAt ?? new Date(),
            isDeleted: zodParsedData.isDeleted ?? false,
        });

        // update the product quantity in product bike collection
        const updatedQuantity = existingProduct.quantity - quantity;

        const updatedInStock = updatedQuantity > 0;

        await ProductServices.updateProductQuantityIntoDB(product, updatedQuantity, updatedInStock);

        return res.status(200).json({
            message: "Order created successfully.",
            status: true,
            data: result,
        });
    } catch (error: any) {
        return res.status(400).json({
            message: error.name,
            status: false,
            error: error
        });
    }
};

// get total revenue
const getOrderRevenue = async (req: Request, res: Response) : Promise<any> =>{
    try {
        const result = await OrderServices.getOrderRevenueFromDB();
        return res.status(200).json({
            message: "Revenue calculated successfully",
            status: true,
            data: result,
        });
    }catch(error: any){
        return res.status(400).json({
            message: error.name,
            status: false,
            error: error
        });
    }
}

export const OrderController = {
    createOrder,
    getOrderRevenue,
};