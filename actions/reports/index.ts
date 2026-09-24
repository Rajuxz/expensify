"use server"
// Data for the PDF reports.
//
// Periods and the date/time printed on each row use the USER's timezone
// (lib/dates/ranges.ts), not the server's. Ranges are half-open (gte/lt).
import requireUser from "@/lib/auth/getCurrentUser"
import { userTimeZone } from "@/lib/auth/timezone"
import { getMonthName } from "@/lib/helpers/getMonthName"
import { prisma } from "@/lib/prisma"
import { decimalToNumber, sumAmounts } from "@/lib/money"
import {
    dayRange,
    formatInZone,
    monthRange,
    yearRange,
    zonedYearMonth,
    type DateRange,
} from "@/lib/dates/ranges"

// Expenses in a range, as report rows formatted in the user's timezone.
async function reportRows(userId: string, zone: string, range: DateRange) {
    const expenses = await prisma.expenses.findMany({
        where: {
            userId,
            isDeleted: false,
            expense_date: { gte: range.start, lt: range.end },
        },
        include: { category: true },
        orderBy: { expense_date: "asc" },
    })

    const rows = expenses.map((e) => ({
        time: formatInZone(e.expense_date, zone, "hh:mm a"),
        date: formatInZone(e.expense_date, zone, "M/dd/yyyy"),
        category: e.category?.name ?? "Uncategorized",
        title: e.title,
        paymentType: e.transaction_type,
        amount: decimalToNumber(e.amount),
        note: e.description ?? "",
    }))
    return { rows, total: sumAmounts(rows.map((r) => r.amount)) }
}

async function viewer() {
    const user = await requireUser()
    return { user, zone: userTimeZone(user) }
}

/** Today's expenses (the user's today). */
export async function getDailyReportData() {
    const { user, zone } = await viewer()
    const range = dayRange(zone)
    const { rows, total } = await reportRows(user.id, zone, range)
    return {
        date: formatInZone(range.start, zone, "yyyy-MM-dd"),
        total,
        user: user.username,
        rows,
    }
}

/**
 * Expenses between two instants [from, to]. The client computes the
 * boundaries (start/end of its local days) for custom ranges.
 */
export async function getWeeklyReport(from: Date, to: Date) {
    const { user, zone } = await viewer()
    if (
        !(from instanceof Date) ||
        !(to instanceof Date) ||
        isNaN(from.getTime()) ||
        isNaN(to.getTime()) ||
        from > to
    ) {
        throw new Error("Invalid date range.")
    }

    // `to` is inclusive (end of day); make it half-open for the query
    const range = { start: from, end: new Date(to.getTime() + 1) }
    const { rows, total } = await reportRows(user.id, zone, range)
    return {
        from: formatInZone(from, zone, "yyyy-MM-dd"),
        to: formatInZone(to, zone, "yyyy-MM-dd"),
        user: user.username,
        total,
        rows,
    }
}

/** This calendar month's expenses. */
export async function getMonthlyReport() {
    const { user, zone } = await viewer()
    const { month } = zonedYearMonth(zone)
    const { rows, total } = await reportRows(user.id, zone, monthRange(zone))
    return {
        monthName: getMonthName(month),
        user: user.username,
        total,
        rows,
    }
}

/** This calendar year's expenses. */
export async function getYearlyReport() {
    const { user, zone } = await viewer()
    const { year } = zonedYearMonth(zone)
    const { rows, total } = await reportRows(user.id, zone, yearRange(zone))
    return {
        year,
        user: user.username,
        total,
        rows,
    }
}
