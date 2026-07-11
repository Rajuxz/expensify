import * as z from "zod"

export const expenseSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title must be under 100 characters"),

    amount: z
        .transform(Number)
        .pipe(
            z
                .number()
                .min(1, "Please enter your price.")
                .positive("Amount must be greater than 0")
                .multipleOf(0.01, "Amount can have at most 2 decimal places")
        ),

    description: z
        .string()
        .min(1, "Description is required")
        .max(100, "Description must be under 100 characters"),

    expense_date: z.date(),
    transaction_type: z.enum(["CASH", "ONLINE"]),
    categoryId: z.string().check(z.uuid("Invalid category ID")),
})

// Infer the TypeScript type from the schema
export type ExpenseFormData = z.infer<typeof expenseSchema>
