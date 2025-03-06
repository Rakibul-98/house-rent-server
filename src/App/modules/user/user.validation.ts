import { z } from "zod";

// User data validation with Zod
const userValidationSchema = z.object({
  body: z.object({
    user_name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(30, "Must be less than 30 characters")
      .refine((value) => /^[A-Z]/.test(value), {
        message: "Name must start with a capital letter",
      }),
    email: z.string().email("Invalid email address").nonempty("Email is required"),
    phone_num: z
      .string()
      .min(1, "Phone number is required")
      .refine((value) => /^\d{7,15}$/.test(value), {
        message: "Phone number must be between 7 and 15 digits",
      }),
    password: z.string().min(4, "Password must be at least 4 characters long"),
    profile_image: z.string().optional().default("https://ibb.co.com/mCdw2wR9"),
    role: z.enum(["tenant", "admin", "owner"]),
    isBlocked: z.boolean().optional().default(false),
    isDeleted: z.boolean().optional().default(false),
  }),
});

export default userValidationSchema;