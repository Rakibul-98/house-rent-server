import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { ListingModel } from "../listing/listing.models";
import QueryBuilder from "../../utils/queryBuilder";
import { RequestModel } from "./request.models";
import AppError from "../../errors/AppError";
import { requestUtils } from "./request.utils";
import { PopulatedListingType, PopulatedRequestType, requestType } from "./request.interfaces";
import { sendMail } from "../../utils/sendMail";


const createRequestIntoDB = async (
  requestData: requestType,
  loggedInUser: JwtPayload
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

  // Create the request
  let request = await RequestModel.create(
    {
      listing: requestData.listing,
      totalAmount: requestData.totalAmount,
      phone: requestData.phone,
      tenant: requestData.tenant,
      message: requestData.message,
    });

  // Populate tenant and product details
  await request.populate([
    {
      path: "tenant",
      select: "-password -__v",
    },
    {
      path: "listing",
      select: "-__v",
      populate: {
        path: "owner",
        select: "-password -__v",
      },
    },
  ]);

  return request;
};

const initiatePaymentService = async (id: string, client_ip: string, loggedInUser: JwtPayload) => {

  let request = await RequestModel.findById(id);

  if (!request || request.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Request not found!");
  }

  if (request.tenant.toString() !== loggedInUser._id.toString()) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You can only pay for your own requests!"
    );
  }

  if (request.requestStatus !== "approved") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Payment is only available after request approval."
    );
  }

  // payment integration
  const shurjopayPayload = {
    amount: request.totalAmount,
    order_id: request._id,
    currency: "BDT",
    customer_name: loggedInUser.user_name,
    customer_email: loggedInUser.email,
    customer_phone: request.phone,
    customer_address: "N/A",
    customer_city: "N/A",
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

}


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
      populate: {
        path: "owner",
        select: "-password -__v",
      },
    },
  ]);

  // Admin: Can see all requests
  if (loggedInUser.role !== "admin") {
    if (loggedInUser.role === "tenant") {
      // Tenant: See only their own requests
      requestQuery = requestQuery.where("tenant").equals(loggedInUser._id);
    } else if (loggedInUser.role === "owner") {
      // Owner: See only requests related to their listings
      const ownerListings = await ListingModel.find({ owner: loggedInUser._id }).select("_id");

      if (ownerListings.length > 0) {
        const listingIds = ownerListings.map((listing) => listing._id);
        requestQuery = requestQuery.where("listing").in(listingIds);
      } else {
        return { totalData: 0, result: [] }; // If no listings, return empty data
      }
    }
  }

  // Apply filters, sorting, pagination, and search functionality
  const finalQuery = new QueryBuilder(requestQuery, query)
    .search(["name", "user_name", "email"]) // Define searchable fields
    .filter()
    .sort()
    .limit()
    .paginate();

  // Fetching the filtered results
  const result = await finalQuery.modelQuery;

  // Counting total matching records
  const totalData = await RequestModel.countDocuments(
    new QueryBuilder(RequestModel.find({ isDeleted: { $ne: true } }), query)
      .search(["name", "user_name", "email"])
      .filter()
      .modelQuery.getFilter()
  );

  return { totalData, result };
};


const getSingleRequestFromDB = async (id: string, loggedInUser: JwtPayload) => {

  const request = await RequestModel.findById(id).populate([
    {
      path: "tenant",
      select: "-password -__v",
    },
    {
      path: "listing",
      select: "-__v",
      populate: {
        path: "owner",
        select: "-password -__v",
      },
    },
  ]);

  // If the request is not found or has been deleted, throw an error
  if (!request || request.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Request not found or has been deleted.");
  }

  const populatedRequest = request as unknown as PopulatedRequestType;

  // If the user is not an admin, check if they are the tenant or the owner of the listing
  if (loggedInUser.role !== "admin") {
    // Tenant can only view their own request
    if (loggedInUser.role === "tenant" && !request.tenant.equals(loggedInUser._id)) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to view this request.");
    }

    // Owner can only view requests related to their own listing
    if (
      loggedInUser.role === "owner" &&
      !(populatedRequest.listing as PopulatedListingType).owner._id.equals(loggedInUser._id)
    ) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to view this request.");
    }
  }

  // If the user is authorized, return the request data
  return request;
};

const updateRequestStatusIntoDB = async (id: string, newStatus: string, loggedInUser: JwtPayload) => {

  const request = await RequestModel.findById(id);
  if (!request || request.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Request not found!");
  }

  const updatedPaymentStatus = newStatus === "approved" ? "active" : "inactive";

  let result;

  if (loggedInUser.role === "admin") {
    // Admin can update any request status
    result = await RequestModel.findByIdAndUpdate(
      id,
      {
        requestStatus: newStatus,
        paymentStatus: updatedPaymentStatus
      },
      { new: true }
    );
  }else if (loggedInUser.role === "owner") {
    // Owner can only update requests related to their own listing
    const listing = await ListingModel.findById(request.listing);

    // If the owner of the listing is not the same as the logged-in user, deny access
    if (!listing || listing?.owner?.toString() !== loggedInUser._id.toString()) {
      throw new AppError(httpStatus.FORBIDDEN, "You can only update requests for your own listings!");
    }

    // If the owner is the correct one, allow updating the status
    result = await RequestModel.findByIdAndUpdate(
      id,
      {
        requestStatus: newStatus,
        paymentStatus: updatedPaymentStatus
      },
      { new: true }
    );
  }
  if(result){
    await sendMail(request.listing, newStatus, request.tenant);
  }
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

  if (request.tenant?.toString() === payload._id.toString() || payload.role === "admin") {
    const result = await RequestModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    return result;
  }

  throw new AppError(
    httpStatus.FORBIDDEN,
    "You are not authorized delete this request"
  );
};

const verifyPayment = async (request_id: string) => {
  const verifiedPayment = await requestUtils.verifyPaymentAsync(request_id);

  if (verifiedPayment.length) {
    const updatedRequest = await RequestModel.findOneAndUpdate(
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
        paymentStatus:
          verifiedPayment[0].bank_status === "Success"
            ? "paid"
            : verifiedPayment[0].bank_status === "Failed"
              ? "active"
              : verifiedPayment[0].bank_status === "Cancel"
                ? "active"
                : "",
      },
      { new: true }
    );
    if (verifiedPayment[0].bank_status === "Success" && updatedRequest) {
      const listing = await ListingModel.findById(updatedRequest.listing);

      if (listing) {
        listing.isAvailable = false;
        await listing.save();
      }
    }
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
  initiatePaymentService
};
