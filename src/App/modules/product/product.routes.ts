import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ProductController } from "./product.controller";
import bikeValidationSchema from "./product.validators";

const router = express.Router();

// create user route with proper validation
router.post(
  "/",
  auth("admin"),
  validateRequest(bikeValidationSchema),
  ProductController.createBike
);

// get all blogs with public api
router.get("/", ProductController.getAllBikes);

router.get("/:id", ProductController.getSingleBike);

// update blog proper validation for user only
router.patch(
  "/:id",
  auth("admin"),
  // validateRequest(bikeValidationSchema),
  ProductController.updateBike
);

// delete blog by user only
router.delete("/:id", auth("admin"), ProductController.deleteBike);

export const ProductRoutes = router;
