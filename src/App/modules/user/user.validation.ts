import { z } from "zod";

// user data validation with zod validation
const userValidationSchema = z.object({
    body: z.object({
        user_name: z
            .string()
            .trim()
            .min(1, "Name is required")
            .max(30, "Must be less than 30 characters")
            .refine((value) => /^[A-Z]/.test(value), {
                message: 'Name must start with a capital letter',
            }),
        email: z
            .string()
            .email("Invalid email address")
            .nonempty("Email is required"),
        password: z
            .string()
            .min(4, "Password must be at least 4 characters long"),
        role: z.enum(["customer", "admin"]).optional().default("customer"),
        isBlocked: z.boolean().optional().default(false),
    })
});

export default userValidationSchema;
