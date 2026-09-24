"use server"
import {
    getCashVsOnlineSplit,
    getReportStats,
    getSpendingPerCategory,
} from "@/actions/expense/stats"
import ExpenseReport from "@/features/reports/components/expense-report"

export default async function Report() {
    // periods are resolved in the user's timezone inside the actions
    const [stats, paymentTypeData, categoryWiseData] = await Promise.all([
        getReportStats(),
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
