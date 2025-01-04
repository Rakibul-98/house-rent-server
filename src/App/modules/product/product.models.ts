import { model, Schema } from "mongoose";
import { BikeType } from "./product.interfaces";

// creating bike schema from the bikeType interface
const bikeSchema: Schema<BikeType> = new Schema<BikeType>({
  name: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ["Mountain", "Road", "Hybrid", "Electric"],
    required: true,
  },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  inStock: { type: Boolean, required: true },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  isDeleted: { type: Boolean },
});


// stop display deleted items
bikeSchema.pre('find',function(next){
  this.find({isDeleted:{$ne:true}});
  next();
})

// stop finding deleted items by specific search
bikeSchema.pre('findOne',function(next){
  this.findOne({isDeleted:{$ne:true}});
  next();
})

// stop finding deleted items by aggregation
bikeSchema.pre('aggregate',function(next){
  this.pipeline().unshift({$match:{isDeleted :{$ne:true}}});
  next();
})

// create a bike model to create collection in database with bikeSchema
export const BikeModel = model<BikeType>("Bike", bikeSchema);