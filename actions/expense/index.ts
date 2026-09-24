"use server"
import requireUser from "@/lib/auth/getCurrentUser"
import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { expenseSchema, ExpenseFormData } from "@/schemas/expense"
import { Expense } from "@/types/expenseTableTypes"
import { refresh } from "next/cache"
import * as z from "zod"
import { decimalToNumber } from "@/lib/money"
// Dashboard/report statistics live in ./stats.ts

export async function createExpense(input: ExpenseFormData) {
    const user = await requireUser()
    const parsed = expenseSchema.safeParse(input)
    if (!parsed.success) {
        return { success: false, error: "Invalid expense details" }
    }

    try {
        const category = parsed.data.categoryId
            ? await prisma.categories.findFirst({
                  where: { id: parsed.data.categoryId, userId: user.id },
                  select: { id: true },
              })
            : null

        const expense = await prisma.expenses.create({
            data: {
                title: parsed.data.title,
                amount: parsed.data.amount,
                description: parsed.data.description,
                expense_date: parsed.data.expense_date,
                transaction_type: parsed.data.transaction_type,
                userId: user.id,
                categoryId: category?.id ?? null,
            },
        })

        refresh()
        // Decimal isn't serializable to client components -> plain number
        return {
            success: true,
            data: { ...expense, amount: decimalToNumber(expense.amount) },
        }
    } catch (error) {
        console.error("Failed to create expense:", error)
        return { success: false, error: "Failed to create expense" }
    }
}

export async function getExpenses(): Promise<Expense[]> {
    const user = await requireUser()

    const expenses = await prisma.expenses.findMany({
        include: { category: { select: { id: true, name: true } } },
        where: { isDeleted: false, userId: user.id },
        orderBy: { expense_date: "desc" },
    })
    return expenses.map((e) => ({ ...e, amount: decimalToNumber(e.amount) }))
}

export async function updateExpenses(
    expenseId: string,
    values: ExpenseFormData
) {
    try {
        const user = await requireUser()

        const existing = await prisma.expenses.findFirst({
            where: { userId: user.id, id: expenseId },
        })

        if (!existing) {
            return { success: false, error: "Expense not found." }
        }

        const category = values.categoryId
            ? await prisma.categories.findFirst({
                  where: { id: values.categoryId, userId: user.id },
                  select: { id: true },
              })
            : null

        if (values.categoryId && !category) {
            return { success: false, error: "Invalid category." }
        }

        const updatedExpense = await prisma.expenses.update({
            where: { id: expenseId },
            data: {
                title: values.title,
                amount: values.amount,
                description: values.description,
                expense_date: values.expense_date,
                transaction_type: values.transaction_type,
                categoryId: category?.id ?? null,
                updated_at: new Date(),
            },
            include: { category: true },
        })

        return {
            success: true,
            data: {
                ...updatedExpense,
                amount: decimalToNumber(updatedExpense.amount),
            },
        }
    } catch (error) {
        console.error("Failed to update expense:", error)
        return { success: false, error: "Failed to update expense" }
    }
}

//to soft delete expense.
export async function softDeleteExpense(expenseId: string) {
    try {
        const user = await requireUser()
        //find if the this expense belongs to current user.
        const existingExpense = await prisma.expenses.findFirst({
            where: {
                userId: user.id,
                id: expenseId,
            },
        })

        //no expense found
        if (!existingExpense) {
            return {
                success: false,
                error: "Couldn't find expense.",
            }
        }

        await prisma.expenses.update({
            where: {
                id: expenseId,
            },
            data: {
                isDeleted: true,
                updated_at: new Date(),
            },
        })

        // re-render so the row leaves the table (and shows in Recently deleted)
        refresh()

        //update either resolves or rejected. So, wrapping it inside if-else would be dead block
        return {
            success: true,
            data: "Expense deleted successfully.",
        }
    } catch (error) {
        console.error(`[ERROR] Deleting Expense: ${error}`)
        return {
            success: false,
            error: "Failed to delete expense",
        }
    }
}

const bulkCategorySchema = z
    .array(
        z.object({
            id: z.uuid(),
            categoryId: z.uuid().nullable(),
        })
    )
    .min(1)
    .max(500)

// Re-categorize many expenses at once. All-or-nothing: if any expense or
// category doesn't belong to the user, nothing is written.
export async function bulkUpdateExpenseCategory(
    input: { id: string; categoryId: string | null }[]
) {
    const user = await requireUser()
    const parsed = bulkCategorySchema.safeParse(input)
    if (!parsed.success) {
        return { success: false, error: "Invalid category changes." }
    }

    // last pick wins if the same expense appears twice
    const updates = new Map(parsed.data.map((u) => [u.id, u.categoryId]))

    const categoryIds = [...new Set(updates.values())].filter(
        (id): id is string => id !== null
    )
    const ownedCategories = await prisma.categories.count({
        where: { id: { in: categoryIds }, userId: user.id },
    })
    if (ownedCategories !== categoryIds.length) {
        return {
            success: false,
            error: "One or more categories no longer exist. Please refresh.",
        }
    }

    // group expenses by target category -> one updateMany per category
    const byCategory = new Map<string | null, string[]>()
    for (const [expenseId, categoryId] of updates) {
        byCategory.set(categoryId, [
            ...(byCategory.get(categoryId) ?? []),
            expenseId,
        ])
    }

    try {
        await prisma.$transaction(async (tx) => {
            let updated = 0
            for (const [categoryId, ids] of byCategory) {
                const res = await tx.expenses.updateMany({
                    where: {
                        id: { in: ids },
                        userId: user.id,
                        isDeleted: false,
                    },
                    data: { categoryId, updated_at: new Date() },
                })
                updated += res.count
            }
            if (updated !== updates.size) throw new Error("EXPENSE_MISMATCH")
        })
    } catch (error) {
        if (error instanceof Error && error.message === "EXPENSE_MISMATCH") {
            return {
                success: false,
                error: "Some expenses were deleted or not found. Please refresh.",
            }
        }
        console.error("Failed to bulk update categories:", error)
        return { success: false, error: "Failed to update categories." }
    }

    refresh()
    return { success: true, count: updates.size }
}

// Soft-delete many expenses at once (sets isDeleted). Only the caller's own,
// not-yet-deleted expenses are touched; anything else is silently skipped.
export async function bulkSoftDeleteExpenses(ids: string[]) {
    const user = await requireUser()
    const parsed = z.array(z.uuid()).min(1).max(500).safeParse(ids)
    if (!parsed.success) {
        return { success: false, error: "Invalid selection." }
    }

    try {
        const { count } = await prisma.expenses.updateMany({
            where: {
                id: { in: [...new Set(parsed.data)] },
                userId: user.id,
                isDeleted: false,
            },
            data: { isDeleted: true, updated_at: new Date() },
        })

        if (count === 0) {
            return {
                success: false,
                error: "Those expenses were already deleted. Please refresh.",
            }
        }

        refresh()
        return { success: true, count }
    } catch (error) {
        console.error("Failed to bulk delete expenses:", error)
        return { success: false, error: "Failed to delete expenses." }
    }
}
