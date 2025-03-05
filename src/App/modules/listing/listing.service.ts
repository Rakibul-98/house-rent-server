import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { ListingType } from "./listing.interfaces";
import { ListingModel } from "./listing.models";
import QueryBuilder from "./listing.queryBuilder";

const createListingIntoDB = async (listing: ListingType) => {
  const newListing = await ListingModel.create(listing);
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
    .search(["name", "brand", "category", "house_description", "features"])
    .filter()
    .sort()
    .limit()
    .paginate();

  // Fetching the results with the owner populated
  const result = await listingQuery.modelQuery;

  // Counting the total number of documents matching the query
  const totalData = await ListingModel.countDocuments(
    new QueryBuilder(ListingModel.find({ isDeleted: { $ne: true } }), query)
      .search(["name", "brand", "category", "house_description", "features"])
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

const deleteListingFromDB = async (_id: string) => {
  const listing = await ListingModel.findOne({ _id, isDeleted: { $ne: true } });

  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
  }

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
