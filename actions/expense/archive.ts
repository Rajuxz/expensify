"use server"
// "Recently deleted" expenses: list, restore, delete forever.
// Always the current user's OWN expenses only. Restores and permanent
// deletes are written to AuditLogs in the same transaction.
import * as z from "zod"
import { revalidatePath } from "next/cache"
import requireUser from "@/lib/auth/getCurrentUser"
import { prisma } from "@/lib/prisma"
import { decimalToNumber } from "@/lib/money"
import { writeAuditLogs } from "@/lib/audit/log"

export type DeletedExpense = {
    id: string
    title: string
    amount: number
    expense_date: Date
    category: string | null
    // soft delete sets updated_at, and deleted rows can't be edited, so
    // this is the deletion time.
    // ponytail: add a real deleted_at column when auto-purge (retention) lands
    deleted_at: Date | null
}

/** The current user's deleted expenses, most recently deleted first. */
export async function getDeletedExpenses(): Promise<DeletedExpense[]> {
    const user = await requireUser()
    const rows = await prisma.expenses.findMany({
        where: { userId: user.id, isDeleted: true },
        include: { category: { select: { name: true } } },
        orderBy: [{ updated_at: "desc" }, { expense_date: "desc" }],
    })
    return rows.map((e) => ({
        id: e.id,
        title: e.title,
        amount: decimalToNumber(e.amount),
        expense_date: e.expense_date,
        category: e.category?.name ?? null,
        deleted_at: e.updated_at,
    }))
}

const idsSchema = z.array(z.uuid()).min(1).max(500)

function revalidate() {
    revalidatePath("/dashboard", "layout") // totals everywhere change
}

/** Put deleted expenses back. Only the caller's own deleted rows. */
export async function restoreExpenses(ids: string[]) {
    const user = await requireUser()
    const parsed = idsSchema.safeParse(ids)
    if (!parsed.success) return { success: false, error: "Invalid selection." }

    try {
        const count = await prisma.$transaction(async (tx) => {
            // only ids that really are this user's deleted expenses
            const targets = await tx.expenses.findMany({
                where: {
                    id: { in: parsed.data },
                    userId: user.id,
                    isDeleted: true,
                },
                select: { id: true, title: true, amount: true },
            })
            if (targets.length === 0) return 0

            await tx.expenses.updateMany({
                where: { id: { in: targets.map((t) => t.id) } },
                data: { isDeleted: false, updated_at: new Date() },
            })
            await writeAuditLogs(
                tx,
                user.id,
                targets.map((t) => ({
                    action: "EXPENSE_RESTORED",
                    entityId: t.id,
                    details: { title: t.title },
                }))
            )
            return targets.length
        })

        if (count === 0) {
            return {
                success: false,
                error: "Nothing to restore. Please refresh.",
            }
        }
        revalidate()
        return { success: true, count }
    } catch (error) {
        console.error("restoreExpenses failed:", error)
        return { success: false, error: "Could not restore expenses." }
    }
}

/**
 * Permanently delete. Only rows that are already soft-deleted and belong
 * to the caller — an active expense can never be purged from here.
 */
export async function purgeExpenses(ids: string[]) {
    const user = await requireUser()
    const parsed = idsSchema.safeParse(ids)
    if (!parsed.success) return { success: false, error: "Invalid selection." }

    try {
        const count = await prisma.$transaction(async (tx) => {
            const targets = await tx.expenses.findMany({
                where: {
                    id: { in: parsed.data },
                    userId: user.id,
                    isDeleted: true,
                },
                select: {
                    id: true,
                    title: true,
                    amount: true,
                    expense_date: true,
                },
            })
            if (targets.length === 0) return 0

            // log first, with a snapshot: after this the row is gone
            await writeAuditLogs(
                tx,
                user.id,
                targets.map((t) => ({
                    action: "EXPENSE_PURGED",
                    entityId: t.id,
                    details: {
                        title: t.title,
                        amount: decimalToNumber(t.amount),
                        expense_date: t.expense_date.toISOString(),
                    },
                }))
            )
            await tx.expenses.deleteMany({
                where: { id: { in: targets.map((t) => t.id) } },
            })
            return targets.length
        })

        if (count === 0) {
            return {
                success: false,
                error: "Nothing to delete. Please refresh.",
            }
        }
        revalidatePath("/dashboard/transactions/deleted")
        return { success: true, count }
    } catch (error) {
        console.error("purgeExpenses failed:", error)
        return { success: false, error: "Could not delete expenses." }
    }
}
