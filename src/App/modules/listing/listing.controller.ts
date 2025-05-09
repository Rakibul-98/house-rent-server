import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ListingServices } from "./listing.service";

const createListing = catchAsync(async (req, res) => {
  const listingData = req.body;
  console.log(listingData);
  const loggedInUser = req.user;
  const result = await ListingServices.createListingIntoDB(listingData, loggedInUser);

  // send response
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Listing created successfully",
    data: result,
  });
});

const getAllListings = catchAsync(async (req, res) => {
  const { totalData, result } = await ListingServices.getAllListingsFromDB(
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listings fetched successfully",
    data: { result: result, totalData: totalData },
  });
});

const getSingleListing = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ListingServices.getSingleListingFromDB(id);

  if (!result) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Listing not found!",
      data: {},
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing is retrieved successfully",
    data: result,
  });
});

const updateListing = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateListing = req.body;

  const result = await ListingServices.updateListingIntoDB(id, updateListing);

  if (!result) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Listing not found!",
      data: {},
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing updated successfully",
    data: result,
  });
});

const deleteListing = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ListingServices.deleteListingFromDB(id, req.user);

  if (!result) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Listing not found",
      data: {},
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing deleted successfully",
    data: {},
  });
});

export const ListingController = {
  createListing,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
};
