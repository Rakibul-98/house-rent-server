import express from "express";
import { authValidations } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import { authControllers } from "./auth.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// user login with proper validation
router.post(
  "/login",
  validateRequest(authValidations.loginValidationSchema),
  authControllers.loginUser
);

router.post("/refresh-token", authControllers.refreshToken);

router.put(
  "/change-password",
  auth("admin", "tenant","owner"),
  authControllers.changePassword
);

export const authRoutes = router;
