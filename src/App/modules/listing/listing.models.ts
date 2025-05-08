import { model, Schema } from "mongoose";
import { ListingType } from "./listing.interfaces";

const listingSchema = new Schema<ListingType>(
  {
    propertyTitle: {
      type: String,
      required: [true, "Property title is required!"],
      trim: true,
    },
    areaSize: {
      type: Number,
      required: [true, "Area size is required!"],
      min: [1, "Area size must be a positive number"],
    },
    houseType: {
      type: String,
      required: [true, "House type is required!"],
      enum: {
        values: ["Apartment", "Duplex", "Single Family", "Shared Room", "Penthouse"],
        message: "House type must be one of: Apartment, Duplex, Single Family, Shared Room, Penthouse",
      },
    },
    rentalHouseLocation: {
      type: String,
      required: [true, "Rental house location is mandatory!"],
      trim: true,
    },
    house_description: {
      type: String,
      required: [true, "House description is mandatory!"],
      trim: true,
    },
    rentAmount: {
      type: Number,
      required: [true, "Rent amount is mandatory!"],
      min: [1, "Rent amount must be greater than 0"],
    },
    numberOfBedrooms: {
      type: Number,
      required: [true, "Number of bedrooms is mandatory!"],
      min: [1, "Number of bedrooms must be at least 1"],
    },
    features: {
      type: [String],
      required: [true, "Features are mandatory!"],
    },
    rentalImages: {
      type: [String],
      required: [true, "Rental images are mandatory!"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Stop displaying deleted items
listingSchema.pre("find", function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Stop finding deleted items by specific search
listingSchema.pre("findOne", function (next) {
  this.findOne({ isDeleted: { $ne: true } });
  next();
});

// Stop finding deleted items by aggregation
listingSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

// Create a listing model to create a collection in the database with listingSchema
export const ListingModel = model<ListingType>("Listing", listingSchema);