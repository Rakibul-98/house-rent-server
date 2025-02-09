import { model, Schema } from "mongoose";
import { BikeType } from "./product.interfaces";

// creating bike schema from the bikeType interface
const bikeSchema = new Schema<BikeType>(
  {
    name: {
      type: String,
      required: [true, "Bike name is mandatory!"],
      unique: true,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is mandatory!"],
    },
    price: {
      type: Number,
      required: [true, "Price is mandatory!"],
      min: [1, "Price must be greater than 0"],
      message: "Price must be a valid number",
    },
    category: {
      type: String,
      enum: ["Mountain", "Road", "Hybrid", "Electric"],
      required: [true, "Category is mandatory!"],
    },
    description: {
      type: String,
      required: [true, "Description is mandatory!"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity can't be negative!"],
    },
    inStock: {
      type: Boolean, default: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// stop display deleted items
bikeSchema.pre("find", function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// stop finding deleted items by specific search
bikeSchema.pre("findOne", function (next) {
  this.findOne({ isDeleted: { $ne: true } });
  next();
});

// stop finding deleted items by aggregation
bikeSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

// create a bike model to create collection in database with bikeSchema
export const BikeModel = model<BikeType>("Bike", bikeSchema);
