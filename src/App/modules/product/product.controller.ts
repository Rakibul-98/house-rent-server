import httpStatus from 'http-status';
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductServices } from './product.service';

const createBike = catchAsync(async (req, res) => {
    const bike = req.body;
    const result = await ProductServices.createBikeIntoDB(bike);

    // send response
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Bike created successfully',
        data: result,
    });
});

const getAllBikes = catchAsync(async (req, res) => {
    const result = await ProductServices.getAllBikesFromDB(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bikes fetched successfully',
        data: result,
    });
});

const getSingleBike = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ProductServices.getSingleBikeFromDB(id);

    if (!result) {
        return sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: 'Bike not found!',
            data: {}
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bike is retrieved successfully',
        data: result,
    })
});

const updateBike = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateBike = req.body;

    const result = await ProductServices.updateBikeIntoDB(id, updateBike);

    if (!result) {
        return sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: 'Bike not found!',
            data: {}
        });
    }
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bike updated successfully',
        data: result,
    })
});

const deleteBike = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ProductServices.deleteBikeFromDB(id);

    if (!result) {
        return sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: 'Bike not found',
            data: {}
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bike deleted successfully',
        data: {},
    })
})

export const ProductController = {
    createBike,
    getAllBikes,
    getSingleBike,
    updateBike,
    deleteBike,
}