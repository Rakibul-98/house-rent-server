import { BikeType } from "./product.interfaces";
import { BikeModel } from "./product.models";


// create bike into database
const createBikeIntoDB = async (bike: BikeType) => {
    const result = await BikeModel.create(bike);
    return result;
}

export const ProductServices = {
    createBikeIntoDB,
}