import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { BikeType } from "./product.interfaces";
import { BikeModel } from "./product.models";
import QueryBuilder from "./product.queryBuilder";

const createBikeIntoDB = async (bike: BikeType) => {
  const newBike = await BikeModel.create(bike);
  return newBike;
};

const getAllBikesFromDB = async (query: Record<string, unknown>) => {
  // implementing the search query
  const bikeQuery = new QueryBuilder(BikeModel.find(), query)
    .search(["name", "brand", "category", "description", "features"])
    .filter()
    .sort()
    .limit()
    .paginate();

  const result = await bikeQuery.modelQuery;

  const totalData = await BikeModel.countDocuments(
    new QueryBuilder(BikeModel.find({ isDeleted: { $ne: true } }), query)
      .search(["name", "brand", "category", "description", "features"])
      .filter()
      .modelQuery.getFilter()
  );
  return { totalData, result };
};

const getSingleBikeFromDB = async (id: string) => {
  const bike = await BikeModel.findById(id);
  return bike;
};

const updateBikeIntoDB = async (_id: string, updateBike: Partial<BikeType>) => {
  const bike = await BikeModel.findOne({ _id, isDeleted: { $ne: true } });

  if (!bike) {
    throw new AppError(httpStatus.NOT_FOUND, "Bike not found");
  }

  const updateFields = { ...updateBike, updatedAt: new Date() };

  if (updateFields.available_quantity !== undefined) {
    updateFields.inStock = updateFields.available_quantity > 0;
  }

  const updatedBike = await BikeModel.findByIdAndUpdate(
    _id,
    { $set: updateFields },
    { new: true }
  );

  return updatedBike;
};

const deleteBikeFromDB = async (_id: string) => {
  const bike = await BikeModel.findOne({ _id, isDeleted: { $ne: true } });

  if (!bike) {
    throw new AppError(httpStatus.NOT_FOUND, "Bike not found");
  }

  const deletedBike = await BikeModel.updateOne(
    { _id, isDeleted: { $ne: true } },
    { isDeleted: true },
    { new: true }
  );
  return deletedBike;
};

export const ProductServices = {
  createBikeIntoDB,
  getAllBikesFromDB,
  getSingleBikeFromDB,
  updateBikeIntoDB,
  deleteBikeFromDB,
};
