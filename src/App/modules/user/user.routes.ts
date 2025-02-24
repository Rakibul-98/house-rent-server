import express from "express";
import { userControllers } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import userValidationSchema from "./user.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/register-user",
  validateRequest(userValidationSchema),
  userControllers.createUser
);

router.get("/", auth("admin"), userControllers.getAllUsers);

router.get("/:email", auth("admin", "customer"), userControllers.getSingleUser);

router.patch("/:userId", auth("customer", "admin"), userControllers.updateUser);

export const userRoutes = router;
