"use server"
import {
    getCashVsOnlineSplit,
    getReportStats,
    getSpendingPerCategory,
} from "@/actions/expense"
import { getStartOfWeek } from "@/lib/helpers/getStartOfWeek"
import ExpenseReport from "@/features/reports/components/expense-report"

export default async function Report() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const weekStart = getStartOfWeek(now)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const [stats, paymentTypeData, categoryWiseData] = await Promise.all([
        getReportStats(year, month, weekStart, weekEnd),
        getCashVsOnlineSplit(),
        getSpendingPerCategory(),
    ])

    return (
        <ExpenseReport
            initialStats={stats}
            initialPaymentTypeData={paymentTypeData}
            initialCategoryWiseData={categoryWiseData}
        />
    )
}
