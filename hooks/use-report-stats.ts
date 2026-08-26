import { getReportStats } from "@/actions/expense"
import { ReportStats } from "@/features/reports/types"
import { getStartOfWeek } from "@/lib/helpers/getStartOfWeek"
import useSWR from "swr"

// hooks/use-report-stats.ts
export function useReportStats(initialData?: ReportStats) {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const weekStart = getStartOfWeek(now)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const { data } = useSWR(
        ["report-stats", year, month, weekStart.toISOString()],
        () => getReportStats(year, month, weekStart, weekEnd),
        { fallbackData: initialData }
    )

    return [
        { label: "Total Transaction", value: data?.totalTransactions },
        { label: "This year", value: data?.yearlyExpense },
        { label: "This Month", value: data?.monthlySpending },
        { label: "This Week", value: data?.weeklySpending },
        { label: "Today", value: data?.dailySpending },
    ]
}
