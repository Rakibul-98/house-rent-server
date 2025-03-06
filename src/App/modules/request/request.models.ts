import { model, Schema } from "mongoose";
import { requestType } from "./request.interfaces";

const requestSchema: Schema<requestType> = new Schema<requestType>(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    message: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["inactive", "paid", "active"],
      default: "inactive",
    },
    requestStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    transaction: {
      id: { type: String },
      transactionStatus: { type: String },
      bank_status: { type: String },
      sp_code: { type: String },
      sp_message: { type: String },
      method: { type: String },
      date_time: { type: String },
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

export const RequestModel = model<requestType>("Request", requestSchema);