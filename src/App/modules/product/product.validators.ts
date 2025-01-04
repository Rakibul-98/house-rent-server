import { z } from "zod";


// bike information validation
const bikeValidationSchema = z.object({
    name: z
        .string()
        .min(1, "Bike name is required")
        .max(50, "Name cannot exceed 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Bike name can't contain numbers")
        .trim(),
    brand: z
        .string()
        .min(1, "Brand is required")
        .max(50, "Brand name cannot exceed 50 characters")
        .trim(),
    price: z
        .number()
        .min(1, "Price must be greater than 0")
        .refine((value) => Number.isFinite(value), "Price must be a valid number"),
    category: z
        .enum(["Mountain", "Road", "Hybrid", "Electric"], {
            required_error: "Category is required",
            invalid_type_error: "Category must be one of Mountain, Road, Hybrid, or Electric",
        }),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters long")
        .max(500, "Description cannot exceed 500 characters")
        .trim()
        .refine(
            (value) => /^[a-zA-Z0-9\s.,'"\-!?()]+$/.test(value),
            "Description can only include letters, numbers, spaces, and basic punctuation"
        ),
    quantity: z
        .number()
        .int("Quantity must be an integer")
        .min(0, "Quantity must be greater than or equal to 0")
        .max(10000, "Quantity cannot exceed 10,000")
        .refine((value) => Number.isFinite(value), "Quantity must be a valid number"),
    // inStock by default true
    inStock: z.boolean().default(true),
    // set createdAt and updatedAt by default while creating bike data
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
    isDeleted: z.boolean().default(false),
});

export default bikeValidationSchema;