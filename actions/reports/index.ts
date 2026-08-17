"use server"
import requireUser from "@/lib/auth/getCurrentUser"
import { getStartOfWeek } from "@/lib/helpers/getStartOfWeek"
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
        rows: expenses.map((e) => ({
            time: e.expense_date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            category: e.category?.name ?? "Uncategorized",
            paymentType: e.transaction_type,
            amount: Number(e.amount),
            note: e.description ?? "",
        })),
    }
}

export async function getWeeklyReport(from: Date, to: Date) {
    const user = await requireUser()
    const now = new Date()
    const weekStart = getStartOfWeek(now)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const expenses = await prisma.expenses.findMany({
        where: {
            isDeleted: false,
            userId: user.id,
            expense_date: { gte: weekStart, lte: weekEnd },
        },
        include: { category: true },
        orderBy: { expense_date: "asc" },
    })
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    return {
        from: weekStart.toISOString().split("T")[0],
        to: weekEnd.toISOString().split("T")[0],
        total,
        rows: expenses.map((e) => ({
            time: e.expense_date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            category: e.category?.name ?? "Uncategorized",
            paymentType: e.transaction_type,
            title: e.title,
            amount: Number(e.amount),
            note: e.description ?? "",
        })),
    }
}
