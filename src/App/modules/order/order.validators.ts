import { z } from "zod";

// Schema for individual order items
const orderItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"), // Validate MongoDB ObjectId
  order_quantity: z.number().min(1, "Quantity must be at least 1"), // Validate quantity
  price: z
    .number()
    .nonnegative("Price must be a non-negative number")
    .optional(), // Validate price
});

// Schema for the entire order
export const orderValidationSchema = z.object({
  body: z.object({
    customer: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid customer ID"), // Validate MongoDB ObjectId
    items: z.array(orderItemSchema).nonempty("At least one item is required"), // Validate array of items
    totalAmount: z
      .number()
      .nonnegative("Total price must be a non-negative number")
      .optional(),
    address: z.string(),
    phone: z.string(),
    orderStatus: z
      .enum([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ])
      .default("pending")
      .optional(), // Validate order status
    isDeleted: z.boolean().default(false).optional(), // Validate isDeleted
  }),
});
