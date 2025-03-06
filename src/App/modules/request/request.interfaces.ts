import { Types } from "mongoose";

export type requestType = {
  tenant: Types.ObjectId;
  listing: Types.ObjectId;
  totalAmount: number;
  phone: string;
  message?: string;
  paymentStatus?:"inactive"
  | "paid"
  | "active";
  requestStatus?:
    "pending"
    | "approved"
    | "rejected";
  transaction?: {
    id: string;
    transactionStatus: string;
    bank_status: string;
    sp_code: string;
    sp_message: string;
    method: string;
    date_time: string;
  };
  isDeleted?: boolean;
};

export type PopulatedOwnerType = {
  _id: Types.ObjectId;
  user_name: string;
  email: string;
  phone_num: string;
  profile_image: string;
  role: string;
  isDeleted: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PopulatedListingType = {
  _id: Types.ObjectId;
  rentalHouseLocation: string;
  house_description: string;
  rentAmount: number;
  numberOfBedrooms: number;
  rentalImages: string[];
  owner: PopulatedOwnerType | Types.ObjectId;
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PopulatedTenantType = {
  _id: Types.ObjectId;
  user_name: string;
  email: string;
  phone_num: string;
  profile_image: string;
  role: string;
  isDeleted: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PopulatedRequestType = {
  _id: Types.ObjectId;
  tenant: PopulatedTenantType | Types.ObjectId;
  listing: PopulatedListingType | Types.ObjectId;
  totalAmount: number;
  phone: string;
  paymentStatus: string;
  requestStatus: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}