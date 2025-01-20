import express from 'express';
import { OrderController } from './order.controllers';

const router = express.Router();

router.post('/',OrderController.createOrder);

router.get('/revenue',OrderController.getOrderRevenue);

export const OrderRoutes = router;

