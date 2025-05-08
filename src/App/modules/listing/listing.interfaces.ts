import { Types } from "mongoose";

export type ListingType = {
  propertyTitle: string;
  areaSize: number;
  houseType:"Apartment" | "Duplex" | "Single Family" | "Shared Room" | "Penthouse";
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
