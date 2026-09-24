"use server"
// Write side of the debts module. Every action is scoped to the current
// user's own debts, and re-validates input with the shared zod schemas.
import * as z from "zod"
import { revalidatePath } from "next/cache"
import requireUser from "@/lib/auth/getCurrentUser"
import { userTimeZone } from "@/lib/auth/timezone"
import { prisma } from "@/lib/prisma"
import {
    debtPaymentSchema,
    debtSchema,
    type DebtFormData,
    type DebtPaymentFormData,
} from "@/schemas/debt"
import { calculateDebt, type DebtInput } from "@/lib/debts/calculate"
import { toDebtInput } from "@/lib/debts/serialize"
import { formatRs } from "@/lib/debts/money"

type Result = { success: true; id?: string } | { success: false; error: string }

const firstIssue = (error: z.ZodError) =>
    error.issues[0]?.message ?? "Invalid input."

function revalidateDebts(id?: string) {
    revalidatePath("/dashboard/debts")
    if (id) revalidatePath(`/dashboard/debts/${id}`)
}

// Loads a debt only if it belongs to the current user.
async function findOwnDebt(id: string) {
    if (!z.uuid().safeParse(id).success) return null
    const user = await requireUser()
    const debt = await prisma.debts.findFirst({
        where: { id, userId: user.id },
        include: { payments: true },
    })
    return debt ? { ...debt, timeZone: userTimeZone(user) } : null
}

/**
 * A set of payments is valid for a debt if none is dated before the start
 * and, replayed through the calculator, none pays more than was owed.
 */
function checkPayments(input: DebtInput): string | null {
    const early = input.payments.find((p) => p.paidOn < input.startDate)
    if (early) return "A payment can't be dated before the debt's start date."

    const state = calculateDebt(input)
    if (state.overpaid > 0) {
        return `That's ${formatRs(state.overpaid)} more than was owed.`
    }
    return null
}

export async function createDebt(input: DebtFormData): Promise<Result> {
    const user = await requireUser()
    const parsed = debtSchema.safeParse(input)
    if (!parsed.success)
        return { success: false, error: firstIssue(parsed.error) }
    const d = parsed.data

    try {
        const debt = await prisma.debts.create({
            data: {
                userId: user.id,
                direction: d.direction,
                counterparty: d.counterparty,
                principal: d.principal,
                monthly_rate: d.monthlyRate,
                start_date: d.startDate,
                note: d.note || null,
            },
        })
        revalidateDebts()
        return { success: true, id: debt.id }
    } catch (error) {
        console.error("createDebt failed:", error)
        return { success: false, error: "Could not save the debt." }
    }
}

export async function updateDebt(
    id: string,
    input: DebtFormData
): Promise<Result> {
    const debt = await findOwnDebt(id)
    if (!debt) return { success: false, error: "Debt not found." }

    const parsed = debtSchema.safeParse(input)
    if (!parsed.success)
        return { success: false, error: firstIssue(parsed.error) }
    const d = parsed.data

    // editing the amount/rate/date must keep existing payments valid
    const problem = checkPayments({
        ...toDebtInput(debt, debt.timeZone),
        principal: d.principal,
        monthlyRate: d.monthlyRate,
        startDate: d.startDate,
    })
    if (problem) return { success: false, error: problem }

    try {
        await prisma.debts.update({
            where: { id },
            data: {
                direction: d.direction,
                counterparty: d.counterparty,
                principal: d.principal,
                monthly_rate: d.monthlyRate,
                start_date: d.startDate,
                note: d.note || null,
                updated_at: new Date(),
            },
        })
        revalidateDebts(id)
        return { success: true, id }
    } catch (error) {
        console.error("updateDebt failed:", error)
        return { success: false, error: "Could not update the debt." }
    }
}

/** Permanently deletes a debt and all its payments. */
export async function deleteDebt(id: string): Promise<Result> {
    const debt = await findOwnDebt(id)
    if (!debt) return { success: false, error: "Debt not found." }

    try {
        await prisma.debts.delete({ where: { id } }) // payments cascade
        revalidateDebts()
        return { success: true }
    } catch (error) {
        console.error("deleteDebt failed:", error)
        return { success: false, error: "Could not delete the debt." }
    }
}

export async function addDebtPayment(
    debtId: string,
    input: DebtPaymentFormData
): Promise<Result> {
    const debt = await findOwnDebt(debtId)
    if (!debt) return { success: false, error: "Debt not found." }

    const parsed = debtPaymentSchema.safeParse(input)
    if (!parsed.success)
        return { success: false, error: firstIssue(parsed.error) }
    const p = parsed.data

    const current = toDebtInput(debt, debt.timeZone)
    const problem = checkPayments({
        ...current,
        payments: [...current.payments, { amount: p.amount, paidOn: p.paidOn }],
    })
    if (problem) return { success: false, error: problem }

    try {
        await prisma.debtPayments.create({
            data: {
                debtId,
                amount: p.amount,
                paid_on: p.paidOn,
                note: p.note || null,
            },
        })
        revalidateDebts(debtId)
        return { success: true }
    } catch (error) {
        console.error("addDebtPayment failed:", error)
        return { success: false, error: "Could not record the payment." }
    }
}

export async function deleteDebtPayment(
    debtId: string,
    paymentId: string
): Promise<Result> {
    const debt = await findOwnDebt(debtId)
    if (!debt) return { success: false, error: "Debt not found." }
    if (!z.uuid().safeParse(paymentId).success) {
        return { success: false, error: "Payment not found." }
    }

    // the payment must belong to this (already ownership-checked) debt
    const { count } = await prisma.debtPayments.deleteMany({
        where: { id: paymentId, debtId },
    })
    if (count === 0) return { success: false, error: "Payment not found." }

    revalidateDebts(debtId)
    return { success: true }
}
