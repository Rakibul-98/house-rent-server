import { z } from "zod";

const orderItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  order_quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z
    .number()
    .nonnegative("Price must be a non-negative number")
    .optional(),
});

const transactionSchema = z.object({
  id: z.string().optional(),
  transactionStatus: z.string().optional(),
  bank_status: z.string().optional(),
  sp_code: z.string().optional(),
  sp_message: z.string().optional(),
  method: z.string().optional(),
  date_time: z.string().optional(),
});

export const orderValidationSchema = z.object({
  body: z.object({
    customer: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid customer ID"),
    items: z.array(orderItemSchema).nonempty("At least one item is required"),
    totalAmount: z
      .number()
      .nonnegative("Total price must be a non-negative number")
      .optional(),
    address: z.string(),
    phone: z.string(),
    orderStatus: z
      .enum([
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ])
      .default("pending")
      .optional(),
    transaction: transactionSchema.optional(),
    isDeleted: z.boolean().default(false).optional(),
  }),
});
