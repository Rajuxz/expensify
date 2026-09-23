// Validation for debts and debt payments. Shared by the forms (client) and
// the server actions (server re-validates everything).
import * as z from "zod"
import { endOfDay } from "date-fns"

const money = (label: string) =>
    z.coerce
        .number({ error: `${label} must be a number` })
        .positive(`${label} must be greater than 0`)
        .max(9_999_999_999, `${label} is too large`)
        .multipleOf(0.01, `${label} can have at most 2 decimal places`)

const notInFuture = (label: string) =>
    z
        .date({ error: `${label} is required` })
        .refine(
            (d) => d <= endOfDay(new Date()),
            `${label} can't be in the future`
        )

export const debtSchema = z.object({
    direction: z.enum(["BORROWED", "LENT"]),
    counterparty: z
        .string()
        .trim()
        .min(1, "Enter who the debt is with")
        .max(80, "Keep it under 80 characters"),
    principal: money("Amount"),
    monthlyRate: z.coerce
        .number({ error: "Rate must be a number" })
        .min(0, "Rate can't be negative")
        .max(50, "Rate must be 50% per month or less")
        .multipleOf(0.01, "Rate can have at most 2 decimal places"),
    startDate: notInFuture("Start date"),
    note: z.string().trim().max(200, "Keep it under 200 characters").optional(),
})

export type DebtFormData = z.infer<typeof debtSchema>

export const debtPaymentSchema = z.object({
    amount: money("Amount"),
    paidOn: notInFuture("Payment date"),
    note: z.string().trim().max(200, "Keep it under 200 characters").optional(),
})

export type DebtPaymentFormData = z.infer<typeof debtPaymentSchema>
