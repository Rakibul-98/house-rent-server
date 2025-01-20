import { z } from "zod";

export const orderZodSchema = z.object({
    email: z.string().email("Invalid email address"),
    product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    totalPrice: z.number().nonnegative("Total price must be a non-negative number").optional(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
    isDeleted: z.boolean().default(false),
});