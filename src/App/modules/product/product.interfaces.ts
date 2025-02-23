export type BikeType = {
  name: string;
  brand: string;
  price: number;
  category: "Mountain" | "Road" | "Hybrid" | "Electric";
  description: string;
  features: string[];
  product_image: string;
  available_quantity: number;
  cart_quantity: number;
  inStock: boolean;
  isDeleted: boolean;
};
