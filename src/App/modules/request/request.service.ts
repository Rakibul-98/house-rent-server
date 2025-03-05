import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { ListingModel } from "../listing/listing.models";
import QueryBuilder from "../listing/listing.queryBuilder";
import { RequestModel } from "./request.models";
import AppError from "../../errors/AppError";
import { requestUtils } from "./request.utils";
import { requestType } from "./request.interfaces";

const createRequestIntoDB = async (
  requestData: requestType,
  loggedInUser: JwtPayload,
  client_ip: string
) => {
  const userStatus = loggedInUser.isBlocked;

  // Check if the user is blocked
  if (userStatus) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Blocked user could not place request!"
    );
  }

  // Update stock for each product in the request
    const listingData = await ListingModel.findById(requestData.listing);
    if (!listingData) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Listing with ID ${requestData.listing} not found!`
      );
    }

    // Update the product quantity
    listingData.isAvailable = false;
    await listingData.save();

  // Create the request
  let request = await RequestModel.create(listingData);

  // Populate tenant and product details
  await request.populate([
    {
      path: "tenant",
      select: "-password -__v",
    },
    {
      path: "listing",
      select: "-__v",
    },
  ]);

  // payment integration
  const shurjopayPayload = {
    amount: requestData.totalAmount,
    request_id: request._id,
    currency: "BDT",
    tenant_name: loggedInUser.user_name,
    tenant_email: loggedInUser.email,
    tenant_phone: requestData.phone,
    tenant_address: "N/A",
    tenant_city: "N/A",
    client_ip,
  };

  const payment = await requestUtils.makePaymentAsync(shurjopayPayload);

  if (payment?.transactionStatus) {
    request = await request.updateOne({
      transaction: {
        id: payment.sp_order_id,
        transactionStatus: payment.transactionStatus,
      },
    });
  }

  return payment.checkout_url;
};

const getAllRequestsFromDB = async (
  query: Record<string, unknown>,
  loggedInUser: JwtPayload
) => {
  let requestQuery = RequestModel.find({ isDeleted: { $ne: true } }).populate([
    {
      path: "tenant",
      select: "-password -__v",
    },
    {
      path: "listing",
      select: "-__v",
    },
  ]);

  // If the user is not an admin, filter requests by tenant ID
  if (loggedInUser.role !== "admin") {
    requestQuery = requestQuery.where("tenant").equals(loggedInUser._id);
  }

  // Apply filters, sorting, and search functionality
  const finalQuery = new QueryBuilder(requestQuery, query)
    .search(["name", "user_name", "email"])
    .sort()
    .filter();

  const result = await finalQuery.modelQuery;
  return result;
};

const getSingleRequestFromDB = async (id: string, loggedInUser: JwtPayload) => {
  let requestQuery = RequestModel.findById({
    _id: id,
    isDeleted: { $ne: true },
  }).populate([
    {
      path: "tenant",
      select: "-password -__v",
    },
    {
      path: "listing",
      select: "-__v",
    },
  ]);

  if (loggedInUser.role !== "admin") {
    requestQuery = requestQuery.where("tenant").equals(loggedInUser._id);
  }

  const result = await requestQuery;
  return result;
};

const updateRequestStatusIntoDB = async (id: string, newStatus: string) => {
  const validStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  const request = await RequestModel.findById(id);
  if (!request || request.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Request not found!");
  }

  const currentStatus = request.requestStatus;

  const currentIndex = validStatuses.indexOf(currentStatus);
  const newIndex = validStatuses.indexOf(newStatus);

  if (newIndex < currentIndex) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot set request status to "${newStatus}"! Request already "${currentStatus}"`
    );
  }

  const result = await RequestModel.findByIdAndUpdate(
    id,
    { requestStatus: newStatus },
    { new: true }
  );
  return result;
};

const deleteRequestFromDB = async (id: string, payload: JwtPayload) => {
  const request = await RequestModel.findById(id);

  if (!request) {
    throw new AppError(httpStatus.NOT_FOUND, "Request not found!");
  }

  if (request.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Request has already been deleted!");
  }

  if (request.tenant._id.toString() !== payload._id.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized delete this request"
    );
  }

  const result = await RequestModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

const verifyPayment = async (request_id: string) => {
  const verifiedPayment = await requestUtils.verifyPaymentAsync(request_id);

  if (verifiedPayment.length) {
    await RequestModel.findOneAndUpdate(
      {
        "transaction.id": request_id,
      },
      {
        "transaction.bank_status": verifiedPayment[0].bank_status,
        "transaction.sp_code": verifiedPayment[0].sp_code,
        "transaction.sp_message": verifiedPayment[0].sp_message,
        "transaction.transactionStatus": verifiedPayment[0].transaction_status,
        "transaction.method": verifiedPayment[0].method,
        "transaction.date_time": verifiedPayment[0].date_time,
        requestStatus:
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

export const RequestServices = {
  createRequestIntoDB,
  getAllRequestsFromDB,
  getSingleRequestFromDB,
  deleteRequestFromDB,
  updateRequestStatusIntoDB,
  verifyPayment,
};
