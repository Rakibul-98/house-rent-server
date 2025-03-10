import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { ListingType } from "./listing.interfaces";
import { ListingModel } from "./listing.models";
import QueryBuilder from "../../utils/queryBuilder";
import { JwtPayload } from "jsonwebtoken";

const createListingIntoDB = async (listing: ListingType, loggedInUser: JwtPayload) => {

  const newListing = await ListingModel.create(
    {
      ...listing,
      owner: loggedInUser._id.toString()
    }
  );
  return newListing;
};

const getAllListingsFromDB = async (query: Record<string, unknown>) => {
  // Implementing the search query with population
  const listingQuery = new QueryBuilder(
    ListingModel.find({ isDeleted: { $ne: true } }).populate({
      path: "owner",
      select: "-password -__v",
    }),
    query
  )
    .search(["rentalHouseLocation", "house_description"])
    .filter()
    .sort()
    .limit()
    .paginate();

  // Fetching the results with the owner populated
  const result = await listingQuery.modelQuery;

  // Counting the total number of documents matching the query
  const totalData = await ListingModel.countDocuments(
    new QueryBuilder(ListingModel.find({ isDeleted: { $ne: true } }), query)
      .search(["rentalHouseLocation", "house_description"])
      .filter()
      .modelQuery.getFilter()
  );

  return { totalData, result };
};

const getSingleListingFromDB = async (id: string) => {
  const listing = await ListingModel.findById(id).populate([
    {
      path: "owner",
      select: "-password -__v",
    }
  ]);
  return listing;
};

const updateListingIntoDB = async (_id: string, updateListing: Partial<ListingType>) => {
  const listing = await ListingModel.findOne({ _id, isDeleted: { $ne: true } });

  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
  }

  const updateFields = { ...updateListing, updatedAt: new Date() };

  const updatedListing = await ListingModel.findByIdAndUpdate(
    _id,
    { $set: updateFields },
    { new: true }
  );

  return updatedListing;
};


const deleteListingFromDB = async (_id: string, loggedInUser: JwtPayload) => {
  // Fetch the listing based on the provided ID, excluding already deleted listings
  const listing = await ListingModel.findOne({ _id, isDeleted: { $ne: true } }).populate('owner');

  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
  }

  // Check if the logged-in user is an admin or the owner of the listing
  if (loggedInUser.role !== "admin" && !listing?.owner?._id.equals(loggedInUser._id)) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete this listing");
  }

  // Update the listing to mark it as deleted
  const deletedListing = await ListingModel.updateOne(
    { _id, isDeleted: { $ne: true } },
    { isDeleted: true },
    { new: true }
  );

  return deletedListing;
};

export const ListingServices = {
  createListingIntoDB,
  getAllListingsFromDB,
  getSingleListingFromDB,
  updateListingIntoDB,
  deleteListingFromDB,
};
