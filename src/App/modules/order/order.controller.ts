import { OrderModel } from "./order.models";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BikeModel } from "../product/product.models";
import { OrderServices } from "./order.service";

const createOrder = catchAsync(async (req, res) => {
  const customer = req.user._id;
  const orderData = {
    ...req.body,
    customer,
  };
  const { quantity, product } = orderData;

  const productDetails = await BikeModel.findById(product);
  if (!productDetails) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Bike not found!",
      data: {},
    });
  }

  if (productDetails.quantity < quantity) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Insufficient stock!",
      data: {},
    });
  }

  const totalPrice = productDetails.price * quantity;

  const result = await OrderServices.createOrderIntoDB({
    ...orderData,
    totalPrice,
  });

  productDetails.quantity -= quantity;
  await productDetails.save();

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order placed successfully!",
    data: result,
  });
});

// get all orders
const getAllOrders = catchAsync(async (req, res) => {
  // get query params
  const result = await OrderServices.getAllOrdersFromDB(req.query, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders fetched successfully",
    data: result,
  });
});

// get single order
const getSingleOrder = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await OrderServices.getSingleOrderFromDB(id, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order fetched successfully",
    data: result,
  });
});

// update order status

const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  const result = await OrderServices.updateOrderStatusIntoDB(id, orderStatus);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

// delete order

const deleteOrder = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await OrderServices.deleteOrderFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order deleted successfully",
    data: result,
  });
});

// get total revenue
// const getOrderRevenue = async (req: Request, res: Response) : Promise<any> =>{
//     try {
//         const result = await OrderServices.getOrderRevenueFromDB();
//         return res.status(200).json({
//             message: "Revenue calculated successfully",
//             status: true,
//             data: result,
//         });
//     }catch(error: any){
//         return res.status(400).json({
//             message: error.name,
//             status: false,
//             error: error
//         });
//     }
// }

export const OrderController = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
  // getOrderRevenue,
};
