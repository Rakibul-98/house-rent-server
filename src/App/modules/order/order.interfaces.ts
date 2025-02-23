import { Types } from "mongoose";

type OrderItemType = {
  product: Types.ObjectId;
  order_quantity: number;
  // price: number;
};

export type orderType = {
  customer: Types.ObjectId;
  items: OrderItemType[];
  totalAmount: number;
  address: string;
  phone: string;
  orderStatus:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  isDeleted: boolean;
};
