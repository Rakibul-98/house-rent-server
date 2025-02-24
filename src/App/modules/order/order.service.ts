import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { BikeModel } from "../product/product.models";
import QueryBuilder from "../product/product.queryBuilder";
import { OrderModel } from "./order.models";
import AppError from "../../errors/AppError";
import { orderType } from "./order.interfaces";
import { orderUtils } from "./order.utils";

const createOrderIntoDB = async (
  orderData: orderType,
  loggedInUser: JwtPayload,
  client_ip: string
) => {
  const userStatus = loggedInUser.isBlocked;

  // Check if the user is blocked
  if (userStatus) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Blocked user could not place order!"
    );
  }

  // Update stock for each product in the order
  for (const item of orderData.items) {
    const product = await BikeModel.findById(item.product);
    if (!product) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Product with ID ${item.product} not found!`
      );
    }

    if (product.available_quantity < item.order_quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Insufficient stock for product ${product.name}!`
      );
    }

    // Update the product quantity
    product.available_quantity -= item.order_quantity;
    if (product.available_quantity <= 0) {
      product.inStock = false;
    }
    if (product.available_quantity >= 1) {
      product.inStock = true;
    }
    await product.save();
  }

  // Create the order
  let order = await OrderModel.create(orderData);

  // Populate customer and product details
  await order.populate([
    {
      path: "customer",
      select: "-password -__v",
    },
    {
      path: "items.product",
      select: "-__v",
    },
  ]);

  // payment integration
  const shurjopayPayload = {
    amount: orderData.totalAmount,
    order_id: order._id,
    currency: "BDT",
    customer_name: loggedInUser.user_name,
    customer_address: orderData.address,
    customer_email: loggedInUser.email,
    customer_phone: orderData.phone,
    customer_city: "N/A",
    client_ip,
  };

  const payment = await orderUtils.makePaymentAsync(shurjopayPayload);

  if (payment?.transactionStatus) {
    order = await order.updateOne({
      transaction: {
        id: payment.sp_order_id,
        transactionStatus: payment.transactionStatus,
      },
    });
  }

  return payment.checkout_url;
};

const getAllOrdersFromDB = async (
  query: Record<string, unknown>,
  loggedInUser: JwtPayload
) => {
  let orderQuery = OrderModel.find({ isDeleted: { $ne: true } }).populate([
    {
      path: "customer",
      select: "-password -__v",
    },
    {
      path: "items.product",
      select: "-__v",
    },
  ]);

  // If the user is not an admin, filter orders by customer ID
  if (loggedInUser.role !== "admin") {
    orderQuery = orderQuery.where("customer").equals(loggedInUser._id);
  }

  // Apply filters, sorting, and search functionality
  const finalQuery = new QueryBuilder(orderQuery, query)
    .search(["name", "user_name", "email"])
    .sort()
    .filter();

  const result = await finalQuery.modelQuery;
  return result;
};

const getSingleOrderFromDB = async (id: string, loggedInUser: JwtPayload) => {
  let orderQuery = OrderModel.findById({
    _id: id,
    isDeleted: { $ne: true },
  }).populate([
    {
      path: "customer",
      select: "-password -__v",
    },
    {
      path: "items.product",
      select: "-__v",
    },
  ]);

  if (loggedInUser.role !== "admin") {
    orderQuery = orderQuery.where("customer").equals(loggedInUser._id);
  }

  const result = await orderQuery;
  return result;
};

const updateOrderStatusIntoDB = async (id: string, newStatus: string) => {
  const validStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  const order = await OrderModel.findById(id);
  if (!order || order.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found!");
  }

  const currentStatus = order.orderStatus;

  const currentIndex = validStatuses.indexOf(currentStatus);
  const newIndex = validStatuses.indexOf(newStatus);

  if (newIndex < currentIndex) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot set order status to "${newStatus}"! Order already "${currentStatus}"`
    );
  }

  const result = await OrderModel.findByIdAndUpdate(
    id,
    { orderStatus: newStatus },
    { new: true }
  );
  return result;
};

const deleteOrderFromDB = async (id: string, payload: JwtPayload) => {
  const order = await OrderModel.findById(id);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found!");
  }

  if (order.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Order has already been deleted!");
  }

  if (order.orderStatus === "processing" || order.orderStatus === "shipped") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Order has already ${order.orderStatus}, you can't delete now!`
    );
  }

  if (order.customer._id.toString() !== payload._id.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized delete this order"
    );
  }

  const result = await OrderModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

const verifyPayment = async (order_id: string) => {
  const verifiedPayment = await orderUtils.verifyPaymentAsync(order_id);

  if (verifiedPayment.length) {
    await OrderModel.findOneAndUpdate(
      {
        "transaction.id": order_id,
      },
      {
        "transaction.bank_status": verifiedPayment[0].bank_status,
        "transaction.sp_code": verifiedPayment[0].sp_code,
        "transaction.sp_message": verifiedPayment[0].sp_message,
        "transaction.transactionStatus": verifiedPayment[0].transaction_status,
        "transaction.method": verifiedPayment[0].method,
        "transaction.date_time": verifiedPayment[0].date_time,
        orderStatus:
          verifiedPayment[0].bank_status === "Success"
            ? "Paid"
            : verifiedPayment[0].bank_status === "Failed"
            ? "Pending"
            : verifiedPayment[0].bank_status === "Cancel"
            ? "Cancelled"
            : "",
      },
      { new: true }
    );
  }

  return verifiedPayment;
};

const getOrderRevenueFromDB = async (query: Record<string, unknown>) => {
  const result = await OrderModel.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
      },
    },
  ]);
  return result.length > 0 ? result[0] : 0;
};

export const OrderServices = {
  createOrderIntoDB,
  getAllOrdersFromDB,
  getOrderRevenueFromDB,
  getSingleOrderFromDB,
  deleteOrderFromDB,
  updateOrderStatusIntoDB,
  verifyPayment,
};
