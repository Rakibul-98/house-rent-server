import express from 'express';
import { ProductControllers } from './product.controllers';

const router = express.Router();

router.post('/', ProductControllers.createBike);

router.get('/', ProductControllers.getAllBikes);

router.get('/:productId', ProductControllers.getASingleBike);

router.put('/:productId', ProductControllers.updateBike);

router.delete('/:productId', ProductControllers.deleteBike);


export const ProductRoutes = router;