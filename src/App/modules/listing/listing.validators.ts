import { z } from "zod";

// Rental house listing data validation
const listingValidationSchema = z.object({
  body: z.object({
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
    rentalImages: z
      .array(z.string().url("Image must be a valid URL"))
      .nonempty("At least one image is required"),
    owner: z.string().min(1, "Owner ID is required").optional(),
    isAvailable: z.boolean().optional().default(true),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export default listingValidationSchema;