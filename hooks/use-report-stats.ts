// hooks/use-report-stats.ts
import { usePeriodStat } from "./use-period-stat"
import {
    getMonthlyExpense,
    getWeeklyExpense,
    getDailyExpense,
    getYearlyExpense,
    getTotalTransaction,
} from "@/actions/expense"
import { getStartOfWeek } from "@/lib/helpers/getStartOfWeek"

export function useReportStats() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const weekStart = getStartOfWeek(now)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const { data: totalTransactions } = usePeriodStat(
        "total-transactions",
        () => getTotalTransaction(year),
        [year]
    )
    const { data: yearlyExpense } = usePeriodStat(
        "yearly-spending",
        () => getYearlyExpense(year),
        [year]
    )
    const { data: monthlySpending } = usePeriodStat(
        "monthly-expense",
        () => getMonthlyExpense(year, month),
        [year, month]
    )
    const { data: weeklySpending } = usePeriodStat(
        "weekly-spending",
        () => getWeeklyExpense(weekStart, weekEnd),
        [weekStart, weekEnd]
    )
    const { data: dailySpending } = usePeriodStat(
        "daily-spending",
        () => getDailyExpense(),
        []
    )

    return [
        { label: "Total Transaction", value: totalTransactions },
        { label: "This year", value: yearlyExpense },
        { label: "This Month", value: monthlySpending },
        { label: "This Week", value: weeklySpending },
        { label: "Today", value: dailySpending },
    ]
}
