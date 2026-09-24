"use server"
// Spending statistics for the dashboard and reports.
//
// Every period ("today", "this week", "this month", ...) is computed in the
// USER's timezone via lib/dates/ranges.ts, never the server's. Callers don't
// pass dates in; each action decides its own range from "now".
// All ranges are half-open (gte start, lt end). Amounts come back as plain
// numbers (Postgres sums DECIMAL exactly; we convert once at the end).
import requireUser from "@/lib/auth/getCurrentUser"
import { userTimeZone } from "@/lib/auth/timezone"
import { prisma } from "@/lib/prisma"
import { decimalToNumber, sumAmounts } from "@/lib/money"
import {
    dayRange,
    monthRange,
    weekRange,
    yearRange,
    zonedDayOfWeek,
    type DateRange,
} from "@/lib/dates/ranges"

// Current user + their timezone, the starting point of every stat.
async function viewer() {
    const user = await requireUser()
    return { userId: user.id, zone: userTimeZone(user) }
}

// Total spent in a range (exact DECIMAL sum in Postgres).
async function totalIn(userId: string, range: DateRange) {
    const result = await prisma.expenses.aggregate({
        _sum: { amount: true },
        where: {
            userId,
            isDeleted: false,
            expense_date: { gte: range.start, lt: range.end },
        },
    })
    return decimalToNumber(result._sum.amount)
}

/** Spent so far this calendar month. */
export async function getMonthlyExpense() {
    const { userId, zone } = await viewer()
    return totalIn(userId, monthRange(zone))
}

/** Spent today. */
export async function getDailyExpense() {
    const { userId, zone } = await viewer()
    return totalIn(userId, dayRange(zone))
}

/** Spent this week (Sunday start). */
export async function getWeeklyExpense() {
    const { userId, zone } = await viewer()
    return totalIn(userId, weekRange(zone))
}

/** Spent this calendar year. */
export async function getYearlyExpense() {
    const { userId, zone } = await viewer()
    return totalIn(userId, yearRange(zone))
}

/** Number of expenses this calendar year. */
export async function getTotalTransaction() {
    const { userId, zone } = await viewer()
    const { start, end } = yearRange(zone)
    return prisma.expenses.count({
        where: {
            userId,
            isDeleted: false,
            expense_date: { gte: start, lt: end },
        },
    })
}

/** Average spent per day across this week (7 days). */
export async function getAverageDailySpend() {
    const { userId, zone } = await viewer()
    const week = weekRange(zone)
    const total = await totalIn(userId, week)
    return Math.round((total / 7) * 100) / 100
}

/** This week's spending per weekday: [{ day: "Sun", total }, ...]. */
export async function getWeeklySpendingTrend() {
    const { userId, zone } = await viewer()
    const { start, end } = weekRange(zone)

    const expenses = await prisma.expenses.findMany({
        where: {
            userId,
            isDeleted: false,
            expense_date: { gte: start, lt: end },
        },
        select: { amount: true, expense_date: true },
    })

    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const buckets: number[][] = labels.map(() => [])
    for (const e of expenses) {
        // weekday as the user sees it, not the server
        buckets[zonedDayOfWeek(zone, e.expense_date)].push(
            decimalToNumber(e.amount)
        )
    }
    return labels.map((day, i) => ({ day, total: sumAmounts(buckets[i]) }))
}

/** CASH vs ONLINE totals for this month. */
export async function getCashVsOnlineSplit() {
    const { userId, zone } = await viewer()
    const { start, end } = monthRange(zone)

    const result = await prisma.expenses.groupBy({
        by: ["transaction_type"],
        where: {
            userId,
            isDeleted: false,
            expense_date: { gte: start, lt: end },
        },
        _sum: { amount: true },
    })

    return result.map((r) => ({
        type: r.transaction_type,
        total: decimalToNumber(r._sum.amount),
    }))
}

/** All-time totals per category. */
export async function getSpendingPerCategory() {
    const { userId } = await viewer()
    const result = await prisma.expenses.groupBy({
        by: ["categoryId"],
        where: { userId, isDeleted: false },
        _sum: { amount: true },
    })

    const categoryIds = result
        .map((r) => r.categoryId)
        .filter((id): id is string => id !== null)
    const categories = await prisma.categories.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
    })
    const names = new Map(categories.map((c) => [c.id, c.name]))

    return result.map((r) => ({
        categoryId: r.categoryId,
        name: r.categoryId
            ? (names.get(r.categoryId) ?? "Unknown")
            : "Uncategorized",
        total: decimalToNumber(r._sum.amount),
    }))
}

/** This month vs last month, with % change and trend direction. */
export async function getMonthOverMonthComparison() {
    const { userId, zone } = await viewer()
    const [current, previous] = await Promise.all([
        totalIn(userId, monthRange(zone)),
        totalIn(userId, monthRange(zone, new Date(), -1)),
    ])

    let percentChange: number | null = null
    if (previous > 0) {
        percentChange = ((current - previous) / previous) * 100
    } else if (current > 0) {
        percentChange = 100 // went from 0 to something — treat as +100%
    }
    // both 0 -> percentChange stays null (nothing to compare)

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

/** The five headline numbers on the reports page. */
export async function getReportStats() {
    const [
        totalTransactions,
        yearlyExpense,
        monthlySpending,
        weeklySpending,
        dailySpending,
    ] = await Promise.all([
        getTotalTransaction(),
        getYearlyExpense(),
        getMonthlyExpense(),
        getWeeklyExpense(),
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
