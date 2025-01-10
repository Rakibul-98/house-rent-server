import { BikeType } from "./product.interfaces";
import { BikeModel } from "./product.models";


// create bike into database
const createBikeIntoDB = async (bike: BikeType) => {
    const result = await BikeModel.create(bike);
    return result;
}

// get all bikes from database
const getAllBikesFromDB = async () => {
    const result = await BikeModel.find();
    return result;
}

// get a single bike
const getSingleBikeFromDB = async (_id: string) => {
    const result = await BikeModel.findOne({ _id });
    return result;
}

// update price and quantity of a bike
const updateBikeIntoDB = async (_id: string, quantity: number, price: number) => {
    const result = await BikeModel.findByIdAndUpdate(
        _id,
        {
            quantity,
            price,
            updatedAt: new Date()
        },
        { new: true }
    );
    return result;
}

// delete a bike
const deleteBikeFromDB = async (_id: string) => {
    return await BikeModel.updateOne({ _id }, { isDeleted: true });
}

export const ProductServices = {
    createBikeIntoDB,
    getAllBikesFromDB,
    getSingleBikeFromDB,
    updateBikeIntoDB,
    deleteBikeFromDB,
}