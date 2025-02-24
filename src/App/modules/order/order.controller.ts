import { OrderModel } from "./order.models";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BikeModel } from "../product/product.models";
import { OrderServices } from "./order.service";

// const createOrder = catchAsync(async (req, res) => {
//   const customer = req.user._id;
//   const orderData = {
//     ...req.body,
//     customer,
//   };
//   const { quantity, product } = orderData;

//   const productDetails = await BikeModel.findById(product);
//   if (!productDetails) {
//     return sendResponse(res, {
//       statusCode: httpStatus.NOT_FOUND,
//       success: false,
//       message: "Bike not found!",
//       data: {},
//     });
//   }

//   if (productDetails.quantity < quantity) {
//     return sendResponse(res, {
//       statusCode: httpStatus.BAD_REQUEST,
//       success: false,
//       message: "Insufficient stock!",
//       data: {},
//     });
//   }

//   const totalPrice = productDetails.price * quantity;

//   const result = await OrderServices.createOrderIntoDB({
//     ...orderData,
//     totalPrice,
//   }, req.user);

//   productDetails.quantity -= quantity;
//   await productDetails.save();

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: "Order placed successfully!",
//     data: result,
//   });
// });

// get all orders

const createOrder = catchAsync(async (req, res) => {
  const customer = req.user._id;
  const { items, totalAmount, phone, address } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "No items in the cart!",
      data: {},
    });
  }
  const orderItems = [];

  for (const item of items) {
    const { product, order_quantity } = item;

    const productDetails = await BikeModel.findById(product);
    if (!productDetails) {
      return sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: `Bike not found!`,
        data: {},
      });
    }

    if (productDetails.available_quantity < order_quantity) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: `Insufficient stock for bike ${productDetails.name}!`,
        data: {},
      });
    }

    orderItems.push({
      product,
      order_quantity,
    });
  }

  // Create the order
  const result = await OrderServices.createOrderIntoDB(
    {
      customer,
      items: orderItems,
      totalAmount,
      phone,
      address,
      orderStatus: "pending",
      isDeleted: false,
      // transaction: {
      //   id: "N/A",
      //   transactionStatus: "pending",
      //   bank_status: "N/A",
      //   sp_code: "N/A",
      //   sp_message: "N/A",
      //   method: "N/A",
      //   date_time: new Date().toISOString(),
      // },
    },
    req.user,
    req.ip!
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order placed successfully!",
    data: result,
  });
});

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

  const result = await OrderServices.deleteOrderFromDB(id, req.user);

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

const verifyPayment = catchAsync(async (req, res) => {
  const order = await OrderServices.verifyPayment(req.query.order_id as string);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment verified successfully",
    data: order,
  });
});

export const OrderController = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
  verifyPayment,
  // getOrderRevenue,
};
