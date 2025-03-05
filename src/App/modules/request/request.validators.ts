import { z } from "zod";

// Transaction schema (optional)
const transactionSchema = z.object({
  id: z.string().optional(),
  transactionStatus: z.string().optional(),
  bank_status: z.string().optional(),
  sp_code: z.string().optional(),
  sp_message: z.string().optional(),
  method: z.string().optional(),
  date_time: z.string().optional(),
});

// Request validation schema
export const requestValidationSchema = z.object({
  body: z.object({
    tenant: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid tenant ID")
      .min(1, "Tenant ID is required"),
    listing: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid listing ID")
      .min(1, "Listing ID is required"),
    totalAmount: z
      .number()
      .nonnegative("Total amount must be a non-negative number")
      .min(1, "Total amount must be at least 1"),
    phone: z.string().min(1, "Phone number is required"),
    paymentStatus: z
      .enum(["pending", "paid", "cancelled"])
      .default("pending")
      .optional(),
    requestStatus: z
      .enum(["pending", "approved", "reject"])
      .default("pending")
      .optional(),
    transaction: transactionSchema.optional(),
    isDeleted: z.boolean().default(false).optional(),
  }),
});