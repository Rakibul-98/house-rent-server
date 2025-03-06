import { Types } from "mongoose";

export type ListingType = {
  rentalHouseLocation: string;
  house_description: string;
  rentAmount: number;
  numberOfBedrooms: number;
  rentalImages: string[];
  owner?: Types.ObjectId;
  isAvailable: boolean;
  isDeleted: boolean;
};
