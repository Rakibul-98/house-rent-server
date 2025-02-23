import { orderType } from "./order.interfaces";
import { model, Schema } from "mongoose";

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Bike", required: true },
  order_quantity: { type: Number, required: true },
  price: { type: Number },
});

const orderSchema: Schema<orderType> = new Schema<orderType>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    isDeleted: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = model<orderType>("Order", orderSchema);
