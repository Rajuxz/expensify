import * as z from "zod"
export const userSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be under 10 characters"),

    phone_number : z.string().length(10,"Invalid phone number").optional(),

    avatar_url: z.string().check(z.url("Invalid URL")).optional(),
})

export type UserFormData = z.infer<typeof userSchema>
