import { z } from "zod";

// validation schema for login request
const loginValidationSchema = z.object({
    body: z.object({
        email: z.string(
            { required_error: "Email is required" }
        ).email(),
        password: z.string(
            { required_error: "Password is required" }
        ).min(8)
    })
})

export const authValidations = {
    loginValidationSchema
}