"use server"
import requireUser from "@/lib/auth/getCurrentUser"
import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { ExpenseFormData } from "@/schemas/expense"
import { Expense } from "@/types/expenseTableTypes"
import { currentUser } from "@clerk/nextjs/server"

export async function createExpense(input: ExpenseFormData) {
    const user = await requireUser()
    try {
        const expense = await prisma.expenses.create({
            data: {
                title: input.title,
                amount: input.amount,
                description: input.description,
                expense_date: input.expense_date ?? new Date(),
                transaction_type: input.transaction_type,
                user: { connect: { id: user.id } },
                category: { connect: { id: input.categoryId } },
            },
        })

        return { success: true, data: expense }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return { success: false, error: "Invalid category or user" }
        }
        throw error
    }
}

export async function getExpenses(): Promise<Expense[]> {
    const user = await requireUser()

    return prisma.expenses.findMany({
        include: { category: { select: { id: true, name: true } } },
        where: { isDeleted: false, userId: user.id },
        orderBy: { expense_date: "desc" },
    })
}

export async function updateExpenses(
    expenseId: string,
    values: ExpenseFormData
) {
    try {
        const updatedExpense = await prisma.expenses.update({
            where: {
                id: expenseId,
            },

            data: {
                title: values.title,
                amount: values.amount,
                description: values.description,
                expense_date: values.expense_date,
                transaction_type: values.transaction_type,
                categoryId: values.categoryId,
                updated_at: new Date(),
            },

            include: {
                category: true,
            },
        })

        return {
            success: true,
            data: updatedExpense,
        }
    } catch (error) {
        console.error("Failed to update expense:", error)

        return {
            success: false,
            error: "Failed to update expense",
        }
    }
}

export async function getMonthlyExpense(year: number, month: number) {
    // month: 0 = January, 1 = February, etc.
    const user = await requireUser()

    const startOfMonth = new Date(year, month, 1)

    const startOfNextMonth = new Date(year, month + 1, 1)

    const result = await prisma.expenses.aggregate({
        _sum: {
            amount: true,
        },

        where: {
            expense_date: {
                gte: startOfMonth,
                lt: startOfNextMonth,
            },
            isDeleted: false,
            userId: user?.id,
        },
    })

    return result._sum.amount ?? 0
}

//to soft delete expense.
export async function softDeleteExpense(expenseId: string) {
    return await prisma.expenses.update({
        where: {
            id: expenseId,
        },
        data: {
            isDeleted: true,
        },
    })
}

// Get spending trends for week
export async function getWeeklySpendingTrend(weekStart: Date) {
    const user = await requireUser()

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const expenses = await prisma.expenses.findMany({
        where: {
            userId: user.id,
            isDeleted: false,
            expense_date: { gte: weekStart, lt: weekEnd },
        },
        select: { amount: true, expense_date: true },
    })

    // bucket by day-of-week
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const totals = days.map((label) => ({ day: label, total: 0 }))

    for (const e of expenses) {
        const dayIndex = e.expense_date.getDay() // 0=Sun..6=Sat
        totals[dayIndex].total += Number(e.amount)
    }

    // [{ day: "Sun", total: 42.5 }, { day: "Mon", total: 0 }, ...]
    return totals
}
