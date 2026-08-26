"use server"
import requireUser from "@/lib/auth/getCurrentUser"
import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { ExpenseFormData } from "@/schemas/expense"
import { Expense } from "@/types/expenseTableTypes"
import { resolveMultipleLabels } from "@base-ui/react/internals/resolveValueLabel"
import { currentUser } from "@clerk/nextjs/server"
import { gte } from "zod"

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

export async function getDailyExpense() {
    const user = await requireUser()
    const today = new Date()

    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const total = await prisma.expenses.aggregate({
        _sum: { amount: true },
        where: {
            expense_date: {
                gte: startOfDay,
                lte: endOfDay,
            },
            isDeleted: false,
            userId: user?.id,
        },
    })

    return Number(total._sum.amount ?? 0)
}

export async function getYearlyExpense(year: number) {
    const user = await requireUser()

    const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0) // Jan 1, 00:00:00
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999) // Dec 31, 23:59:59.999

    const total = await prisma.expenses.aggregate({
        _sum: { amount: true },
        where: {
            expense_date: {
                gte: startOfYear,
                lte: endOfYear,
            },
            isDeleted: false,
            userId: user?.id,
        },
    })

    return Number(total._sum.amount ?? 0)
}
export async function getTotalTransaction(year: number) {
    const user = await requireUser()
    const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0)
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999)

    const result = await prisma.expenses.aggregate({
        _count: { id: true },
        where: {
            isDeleted: false,
            expense_date: { gte: startOfYear, lte: endOfYear },
            userId: user.id,
        },
    })

    return result._count.id ?? 0
}

export async function getWeeklyExpense(from: Date, to: Date) {
    const user = await requireUser()
    const total = await prisma.expenses.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            expense_date: {
                gte: from,
                lte: to,
            },
            isDeleted: false,
            userId: user?.id,
        },
    })
    return total._sum.amount ?? 0
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

// to calculate total cash spending and online spending.
export async function getCashVsOnlineSplit() {
    const user = await requireUser()

    const result = await prisma.expenses.groupBy({
        by: ["transaction_type"],
        where: {
            userId: user.id,
            isDeleted: false,
        },
        _sum: {
            amount: true,
        },
    })

    return result.map((r) => ({
        type: r.transaction_type,
        total: Number(r._sum.amount ?? 0),
    }))
}

export async function getSpendingPerCategory() {
    const user = await requireUser()
    const result = await prisma.expenses.groupBy({
        by: ["categoryId"],
        where: {
            userId: user.id,
            isDeleted: false,
        },
        _sum: {
            amount: true,
        },
    })

    const categories = await prisma.categories.findMany({
        where: { id: { in: result.map((cat) => cat.categoryId) } },
        select: { id: true, name: true },
    })

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

    return result.map((r) => ({
        categoryId: r.categoryId,
        name: categoryMap.get(r.categoryId) ?? "Unknown",
        total: Number(r._sum.amount ?? 0),
    }))
}

//Calculate average spending per day.
export async function getAverageDailySpend(from: Date, to: Date) {
    const user = await requireUser()

    const result = await prisma.expenses.aggregate({
        _sum: { amount: true },
        where: {
            userId: user.id,
            isDeleted: false,
            expense_date: { gte: from, lt: to },
        },
    })

    const total = Number(result._sum.amount ?? 0)
    const days = Math.ceil(
        (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
    )

    return days > 0 ? total / days : 0
}

// compare previous month and this month
export async function getMonthOverMonthComparison(year: number, month: number) {
    const user = await requireUser()

    // current month range
    const currentStart = new Date(year, month, 1)
    const currentEnd = new Date(year, month + 1, 1)

    // previous month range (handles January -> December of prior year automatically)
    const previousStart = new Date(year, month - 1, 1)
    const previousEnd = new Date(year, month, 1)

    const [currentResult, previousResult] = await Promise.all([
        prisma.expenses.aggregate({
            _sum: { amount: true },
            where: {
                userId: user.id,
                isDeleted: false,
                expense_date: { gte: currentStart, lt: currentEnd },
            },
        }),
        prisma.expenses.aggregate({
            _sum: { amount: true },
            where: {
                userId: user.id,
                isDeleted: false,
                expense_date: { gte: previousStart, lt: previousEnd },
            },
        }),
    ])

    const current = Number(currentResult._sum.amount ?? 0)
    const previous = Number(previousResult._sum.amount ?? 0)

    let percentChange: number | null = null
    if (previous > 0) {
        percentChange = ((current - previous) / previous) * 100
    } else if (current > 0) {
        percentChange = 100 // went from 0 to something — treat as +100%
    }
    // if both are 0, percentChange stays null (nothing to compare)

    return {
        current,
        previous,
        percentChange,
        trend:
            percentChange === null
                ? "flat"
                : percentChange > 0
                  ? "up"
                  : percentChange < 0
                    ? "down"
                    : "flat",
    } as const
}

export async function getReportStats(
    year: number,
    month: number,
    weekStart: Date,
    weekEnd: Date
) {
    const [
        totalTransactions,
        yearlyExpense,
        monthlySpending,
        weeklySpending,
        dailySpending,
    ] = await Promise.all([
        getTotalTransaction(year),
        getYearlyExpense(year),
        getMonthlyExpense(year, month),
        getWeeklyExpense(weekStart, weekEnd),
        getDailyExpense(),
    ])

    return {
        totalTransactions,
        yearlyExpense,
        monthlySpending,
        weeklySpending,
        dailySpending,
    }
}
