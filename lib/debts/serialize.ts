// Converts Prisma debt rows (Decimal fields) into plain numbers for the
// calculator and for sending to client components.
import type { Prisma } from "@/lib/generated/prisma/client"
import { calculateDebt, type DebtInput } from "./calculate"

type DebtRow = Prisma.DebtsGetPayload<{ include: { payments: true } }>

export function toDebtInput(debt: DebtRow): DebtInput {
    return {
        principal: debt.principal.toNumber(),
        monthlyRate: debt.monthly_rate.toNumber(),
        startDate: debt.start_date,
        payments: debt.payments.map((p) => ({
            amount: p.amount.toNumber(),
            paidOn: p.paid_on,
        })),
    }
}

/** Debt + its computed state, in the shape the UI uses. */
export function serializeDebt(debt: DebtRow, asOf = new Date()) {
    const input = toDebtInput(debt)
    return {
        id: debt.id,
        direction: debt.direction,
        counterparty: debt.counterparty,
        note: debt.note,
        principal: input.principal,
        monthlyRate: input.monthlyRate,
        startDate: debt.start_date,
        payments: debt.payments
            .map((p) => ({
                id: p.id,
                amount: p.amount.toNumber(),
                paidOn: p.paid_on,
                note: p.note,
            }))
            .sort((a, b) => b.paidOn.getTime() - a.paidOn.getTime()),
        state: calculateDebt(input, asOf),
    }
}

export type DebtView = ReturnType<typeof serializeDebt>
