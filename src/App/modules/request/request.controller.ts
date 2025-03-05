import { RequestModel } from "./request.models";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ListingModel } from "../listing/listing.models";
import { RequestServices } from "./request.service";

const createRequest = catchAsync(async (req, res) => {
  const tenant = req.user._id;
  const { listing, totalAmount, phone } = req.body;

    const listingDetails = await ListingModel.findById(listing);

    if (!listingDetails) {
      return sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: `Listing not found!`,
        data: {},
      });
    }

    if (!listingDetails.isAvailable) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: `This has been already booked!`,
        data: {},
      });
    }

  // Create the requestorder
  const result = await RequestServices.createRequestIntoDB(
    {
      ...
      tenant,
      listing,
      totalAmount,
      phone
    },
    req.user,
    req.ip!
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Request placed successfully!",
    data: result,
  });
});

const getAllRequests = catchAsync(async (req, res) => {
  // get query params
  const result = await RequestServices.getAllRequestsFromDB(req.query, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Requests fetched successfully",
    data: result,
  });
});

// get single order
const getSingleRequest = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await RequestServices.getSingleRequestFromDB(id, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Request fetched successfully",
    data: result,
  });
});

// update order status

const updateRequestStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  const result = await RequestServices.updateRequestStatusIntoDB(id, orderStatus);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Request status updated successfully",
    data: result,
  });
});

const deleteRequest = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await RequestServices.deleteRequestFromDB(id, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Request deleted successfully",
    data: result,
  });
});

const verifyPayment = catchAsync(async (req, res) => {
  const order = await RequestServices.verifyPayment(req.query.order_id as string);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment verified successfully",
    data: order,
  });
});

export const RequestController = {
  createRequest,
  getAllRequests,
  getSingleRequest,
  updateRequestStatus,
  deleteRequest,
  verifyPayment,
};
