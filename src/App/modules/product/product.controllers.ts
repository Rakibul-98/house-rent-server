import { Request, Response } from "express";
import bikeValidationSchema from "./product.validators";
import { ProductServices } from "./product.services";

const createBike = async (req: Request, res: Response): Promise<any> => {
    try {
        // get bike data from client
        const { bike } = req.body;

        // validate bike data with zod validation
        const zodParsedData = bikeValidationSchema.parse(bike);

        // create bike in db
        const result = await ProductServices.createBikeIntoDB(zodParsedData);

        // return success response with created bike data
        return res.status(200).json({
            message: "Bike created successfully",
            success: true,
            data: result
        })
    } catch (err: any) {
        // return error response
        return res.status(400).json({
            message: err.name,
            success: false,
            error: err
        })
    }
}

const getAllBikes = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await ProductServices.getAllBikesFromDB();

        // return success response with retrieved bikes data
        return res.status(200).json({
            message: "Bikes retrived successfully",
            status: true,
            data: result,
        });

    } catch (err: any) {
        // return error response with message
        return res.status(400).json({
            message: err.name,
            status: false,
            error: err,
        });
    }
}

const getASingleBike = async (req: Request, res: Response): Promise<any> => {
    try {
        const { productId } = req.params;

        const result = await ProductServices.getSingleBikeFromDB(productId);

        return res.status(200).json({
            message: "Bike retrived successfully",
            status: true,
            data: result,
        });
    } catch (err: any) {
        return res.status(500).json({
            message: err.name,
            success: false,
            error: err,
        });
    }
}

const updateBike = async (req: Request, res: Response): Promise<any> => {
    try {
        const { productId } = req.params;
        // get the upadated price and quantity
        const { price, quantity } = req.body;

        const result = await ProductServices.updateBikeIntoDB(productId, quantity, price);

        return res.status(200).json({
            message: "Bike updated successfully",
            status: true,
            data: result,
        });
    } catch (err: any) {
        return res.status(400).json({
            message: err.name,
            status: false,
            error: err,
        });
    }
};

const deleteBike = async (req: Request, res: Response): Promise<any> => {
    try {
        const { productId } = req.params;
        const result = await ProductServices.deleteBikeFromDB(productId);
        return res.status(200).json({
            message: "Bike deleted successfully",
            status: true,
            data: {},
        });
    } catch (err: any) {
        return res.status(400).json({
            message: err.name,
            success: false,
            error: err,
        });
    }
}

export const ProductControllers = {
    createBike,
    getAllBikes,
    getASingleBike,
    updateBike,
    deleteBike,
}