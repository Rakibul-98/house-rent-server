import { z } from "zod";

const listingValidationSchema = z.object({
  body: z.object({
    propertyTitle: z
      .string()
      .min(1, "Property title is required!")
      .trim(),

    areaSize: z
      .number({
        required_error: "Area size is required!",
        invalid_type_error: "Area size must be a number",
      })
      .min(1, "Area size must be a positive number"),

    houseType: z.enum(
      ["Apartment", "Duplex", "Single Family", "Shared Room", "Penthouse"],
      {
        required_error: "House type is required!",
        invalid_type_error:
          "House type must be one of: Apartment, Duplex, Single Family, Shared Room, Penthouse",
      }
    ),
    rentalHouseLocation: z
      .string()
      .min(1, "Rental house location is required")
      .trim(),
    house_description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .max(500, "Description cannot exceed 500 characters")
      .trim()
      .refine(
        (value) => /^[a-zA-Z0-9\s.,'"\-!?()]+$/.test(value),
        "Description can only include letters, numbers, spaces, and basic punctuation"
      ),
    rentAmount: z
      .number()
      .min(1, "Rent amount must be greater than 0")
      .refine(
        (value) => Number.isFinite(value),
        "Rent amount must be a valid number"
      ),
    numberOfBedrooms: z
      .number()
      .int("Number of bedrooms must be an integer")
      .min(1, "Number of bedrooms must be at least 1")
      .max(10, "Number of bedrooms cannot exceed 10"),
    features: z
      .array(z.string())
      .nonempty("At least one feature is required"),
    rentalImages: z.array(z.string()).optional(),
    owner: z.string().min(1, "Owner ID is required").optional(),
    isAvailable: z.boolean().optional().default(true),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export default listingValidationSchema;