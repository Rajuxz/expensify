"use server"
import requireUser from "@/lib/auth/getCurrentUser"
import { getMonthName } from "@/lib/helpers/getMonthName"
import { prisma } from "@/lib/prisma"
export async function getDailyReportData(date: Date = new Date()) {
    const user = await requireUser()
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const expenses = await prisma.expenses.findMany({
        where: {
            userId: user.id,
            isDeleted: false,
            expense_date: { gte: startOfDay, lte: endOfDay },
        },
        include: { category: true },
        orderBy: { expense_date: "asc" },
    })

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    return {
        date: startOfDay.toISOString().split("T")[0],
        total,
        user: user.username,
        rows: expenses.map((e) => ({
            time: e.expense_date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            category: e.category?.name ?? "Uncategorized",
            title: e.title,
            paymentType: e.transaction_type,
            amount: Number(e.amount),
            note: e.description ?? "",
        })),
    }
}

// Expenses between two instants (inclusive). The client computes the
// boundaries (start/end of its local day) so the user's timezone is respected.
export async function getWeeklyReport(from: Date, to: Date) {
    const user = await requireUser()
    if (
        !(from instanceof Date) ||
        !(to instanceof Date) ||
        isNaN(from.getTime()) ||
        isNaN(to.getTime()) ||
        from > to
    ) {
        throw new Error("Invalid date range.")
    }

    const expenses = await prisma.expenses.findMany({
        where: {
            isDeleted: false,
            userId: user.id,
            expense_date: { gte: from, lte: to },
        },
        include: { category: true },
        orderBy: { expense_date: "asc" },
    })
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
        user: user.username,
        total,
        rows: expenses.map((e) => ({
            time: e.expense_date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            date: e.expense_date.toLocaleDateString("en-US", {
                month: "numeric",
                day: "2-digit",
                year: "numeric",
            }),
            category: e.category?.name ?? "Uncategorized",
            paymentType: e.transaction_type,
            title: e.title,
            amount: Number(e.amount),
            note: e.description ?? "",
        })),
    }
}

export async function getMonthlyReport(year: number, month: number) {
    const user = await requireUser()
    const startOfMonth = new Date(year, month - 1, 1)

    // Set to 23:59:59.999 of the last day of the month
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

    const expenses = await prisma.expenses.findMany({
        where: {
            isDeleted: false,
            userId: user.id, // Fixed field name (assuming foreign key is userId)
            expense_date: {
                gte: startOfMonth,
                lte: endOfMonth,
            },
        },
        include: { category: true },
        orderBy: { expense_date: "asc" },
    })

    const monthName = getMonthName(month)
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    return {
        monthName,
        user: user.username,
        total,
        rows: expenses.map((e) => ({
            time: e.expense_date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            date: e.expense_date.toLocaleDateString("en-US", {
                month: "numeric",
                day: "2-digit",
                year: "numeric",
            }),
            category: e.category?.name ?? "Uncategorized",
            paymentType: e.transaction_type,
            title: e.title,
            amount: Number(e.amount),
            note: e.description ?? "",
        })),
    }
}

export async function getYearlyReport(year: number) {
    const user = await requireUser()

    // Jan 1st of the given year at 00:00:00
    const startOfYear = new Date(year, 0, 1)

    // Dec 31st of the given year at 23:59:59.999
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999)

    const expenses = await prisma.expenses.findMany({
        where: {
            isDeleted: false,
            userId: user.id,
            expense_date: {
                gte: startOfYear,
                lte: endOfYear,
            },
        },
        include: { category: true },
        orderBy: { expense_date: "asc" },
    })

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    return {
        year,
        user: user.username,
        total,
        rows: expenses.map((e) => ({
            time: e.expense_date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            date: e.expense_date.toLocaleDateString("en-US", {
                month: "numeric",
                day: "2-digit",
                year: "numeric",
            }),
            category: e.category?.name ?? "Uncategorized",
            paymentType: e.transaction_type,
            title: e.title,
            amount: Number(e.amount),
            note: e.description ?? "",
        })),
    }
}
