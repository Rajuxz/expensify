import { getReportStats } from "@/actions/expense/stats"
import { ReportStats } from "@/features/reports/types"
import useSWR from "swr"

// hooks/use-report-stats.ts
export function useReportStats(initialData?: ReportStats) {
    // periods are resolved server-side in the user's timezone
    const { data } = useSWR("report-stats", () => getReportStats(), {
        fallbackData: initialData,
    })

    return [
        { label: "Total Transaction", value: data?.totalTransactions },
        { label: "This year", value: data?.yearlyExpense },
        { label: "This Month", value: data?.monthlySpending },
        { label: "This Week", value: data?.weeklySpending },
        { label: "Today", value: data?.dailySpending },
    ]
}
