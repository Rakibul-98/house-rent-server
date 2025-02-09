import { JwtPayload } from "jsonwebtoken";
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
    .search(["title", "content"])
    .sort()
    .filter();

  const result = await bikeQuery.modelQuery;
  return result;
};

const getSingleBikeFromDB = async (id: string) => {
  const bike = await BikeModel.findById(id);
  return bike;
};

const updateBikeIntoDB = async (
  _id: string,
  updateBike: Partial<BikeType>
) => {
  const bike = await BikeModel.findOne({ _id, isDeleted: { $ne: true } });

  if (!bike) {
    throw new AppError(httpStatus.NOT_FOUND, "Bike not found");
  }

  const updateFields = { ...updateBike, updatedAt: new Date() };

  if (updateFields.quantity !== undefined) {
    updateFields.inStock = updateFields.quantity > 0;
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

// update product quantity for order
const updateProductQuantityIntoDB = async (
  _id: string,
  quantity: number,
  inStock: boolean
) => {
  return await BikeModel.findByIdAndUpdate(
    _id,
    {
      quantity,
      inStock,
      updatedAt: new Date(),
    },
    { new: true }
  );
};

export const ProductServices = {
  createBikeIntoDB,
  getAllBikesFromDB,
  getSingleBikeFromDB,
  updateBikeIntoDB,
  deleteBikeFromDB,
  updateProductQuantityIntoDB,
};
