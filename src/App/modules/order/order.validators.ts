import { z } from "zod";

export const orderValidationSchema = z.object({
  body: z.object({
    customer: z.string().email("Invalid email address").optional(),
    product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    orderStatus: z.enum([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ])
    .default("pending")
    .optional(),
    totalPrice: z
      .number()
      .nonnegative("Total price must be a non-negative number")
      .optional(),
    isDeleted: z.boolean().default(false),
  }),
});
