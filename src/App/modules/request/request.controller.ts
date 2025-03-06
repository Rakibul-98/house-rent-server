import { RequestModel } from "./request.models";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ListingModel } from "../listing/listing.models";
import { RequestServices } from "./request.service";

const createRequest = catchAsync(async (req, res) => {
  const tenant = req.user._id.toString();
  const { listing, totalAmount, phone, message } = req.body;

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

  // Create the requestrequest
  const result = await RequestServices.createRequestIntoDB(
    {
      listing,
      totalAmount,
      phone,
      tenant,
      message
    },
    req.user
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Request placed successfully!",
    data: result,
  });
});

const initiatePayment = catchAsync(async (req, res) =>{
  const { id } = req.params;

  const result = await RequestServices.initiatePaymentService(id, req.ip!, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initialted successfully",
    data: result,
  });
})

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

// get single request
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

// update request status

const updateRequestStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { requestStatus } = req.body;
  const loggedInUser = req.user;

  const result = await RequestServices.updateRequestStatusIntoDB(id, requestStatus, loggedInUser);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Request status updated successfully",
    data: result,
  });
});

const deleteRequest = catchAsync(async (req, res) => {
  const { id } = req.params;

  await RequestServices.deleteRequestFromDB(id, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Request deleted successfully",
    data: {},
  });
});

const verifyPayment = catchAsync(async (req, res) => {
  const request = await RequestServices.verifyPayment(req.query.request_id as string);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment verified successfully",
    data: request,
  });
});

export const RequestController = {
  createRequest,
  getAllRequests,
  getSingleRequest,
  updateRequestStatus,
  deleteRequest,
  verifyPayment,
  initiatePayment,
};
