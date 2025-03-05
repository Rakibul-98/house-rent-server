import express from "express";
import { RequestController } from "./request.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { requestValidationSchema } from "./request.validators";

const router = express.Router();

router.post(
  "/",
  auth("tenant"),
  validateRequest(requestValidationSchema),
  RequestController.createRequest
);

router.get("/verify", auth("tenant"), RequestController.verifyPayment);

router.get("/", auth("admin", "tenant", "owner"), RequestController.getAllRequests);

router.get("/:id", auth("admin", "tenant", "owner"), RequestController.getSingleRequest);

router.put("/:id", auth("admin" , "owner"), RequestController.updateRequestStatus);

router.delete("/:id", auth("tenant", "owner"), RequestController.deleteRequest);

export const RequestRoutes = router;
