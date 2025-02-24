import { Types } from "mongoose";

type OrderItemType = {
  product: Types.ObjectId;
  order_quantity: number;
};

export type orderType = {
  customer: Types.ObjectId;
  items: OrderItemType[];
  totalAmount: number;
  address: string;
  phone: string;
  orderStatus:
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
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
