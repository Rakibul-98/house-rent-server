import { Types } from "mongoose";

export type requestType = {
  tenant: Types.ObjectId;
  listing: Types.ObjectId;
  totalAmount: number;
  phone: string;
  paymentStatus:"pending"
  | "paid"
  | "cancelled";
  requestStatus:
    "pending"
    | "approved"
    | "reject";
  transaction?: {
    id: string;
    transactionStatus: string;
    bank_status: string;
    sp_code: string;
    sp_message: string;
    method: string;
    date_time: string;
  };
  isDeleted: boolean;
};
