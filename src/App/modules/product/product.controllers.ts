import { Request, Response } from "express";
import bikeValidationSchema from "./product.validators";
import { ProductServices } from "./product.services";

const CreateBike = async (req: Request, res: Response): Promise<any> =>{
    try{
        // get bike data from client
        const {bike} = req.body;

        // validate bike data with zod validation
        const zodParsedData = bikeValidationSchema.parse(bike);

        // create bike in db
        const result = await ProductServices.createBikeIntoDB(zodParsedData);

        // return success response with created bike data
        return res.status(200).json({
            message: "Bike created successfully",
            status: true,
            data: result
        })
    }catch(error: any){
        // return error response
        return res.status(400).json({
            message: error.message || "Error creating bike",
            status: false,
            error: error
        })
    }
}

export const ProductControllers = {
    CreateBike
}