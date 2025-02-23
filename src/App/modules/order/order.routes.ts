import express from "express";
import { OrderController } from "./order.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { orderValidationSchema } from "./order.validators";

const router = express.Router();

router.post(
  "/",
  auth("customer"),
  validateRequest(orderValidationSchema),
  OrderController.createOrder
);

router.get("/", auth("admin", "customer"), OrderController.getAllOrders);

router.get("/:id", auth("admin", "customer"), OrderController.getSingleOrder);

router.put("/:id", auth("admin"), OrderController.updateOrderStatus);

router.delete("/:id", auth("customer"), OrderController.deleteOrder);

// router.get('/revenue',OrderController.getOrderRevenue);

export const OrderRoutes = router;
