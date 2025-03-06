import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ListingController } from "./listing.controller";
import listingValidationSchema from "./listing.validators";

const router = express.Router();

// create listing with proper validation
router.post(
  "/",
  auth("owner"),
  validateRequest(listingValidationSchema),
  ListingController.createListing
);

// get all listing with public api
router.get("/", ListingController.getAllListings);

router.get("/:id", ListingController.getSingleListing);

// update listing proper validation for user only
router.patch(
  "/:id",
  auth("owner"),
  ListingController.updateListing
);

// delete listing by user only
router.delete("/:id", auth("owner","admin"), ListingController.deleteListing);

export const ListingRoutes = router;
