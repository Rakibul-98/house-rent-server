import { Types } from "mongoose";

export type ListingType = {
  houseType:string;
  rentalHouseLocation: string;
  house_description: string;
  rentAmount: number;
  numberOfBedrooms: number;
  features:string[];
  rentalImages: string[];
  owner?: Types.ObjectId;
  isAvailable: boolean;
  isDeleted: boolean;
};
