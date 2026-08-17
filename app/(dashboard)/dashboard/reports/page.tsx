"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import ExpenseTypeBreakdown from "@/features/reports/components/expense-type-breakdown"
import { getCashVsOnlineSplit, getSpendingPerCategory } from "@/actions/expense"
import CategoryWiseBreakdown from "@/features/reports/components/category-wise-breakdown"
import { StatCard } from "@/components/dashboard/stat-card"
import useSWR from "swr"
import { useReportStats } from "@/hooks/use-report-stats"
import { ReportFooter } from "@/features/reports/components/report-footer"

export default function ExpenseReport() {
    const statCards = useReportStats()
    const { data: paymentTypeData, isLoading: paymentTypeLoading } = useSWR(
        "payment-type-breakdown",
        getCashVsOnlineSplit
    )

    const { data: categoryWiseData, isLoading: categoryWiseDataLoading } =
        useSWR("spending-per-category", getSpendingPerCategory)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Report</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="text-xs text-muted-foreground">
                All the reports are in Nepalese Ruppes.
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {statCards.map((s) => (
                    <StatCard
                        key={s.label}
                        label={s.label}
                        value={`${s.value ?? "—"}`}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CategoryWiseBreakdown
                    data={categoryWiseData ?? []}
                    isLoading={categoryWiseDataLoading}
                />
                <ExpenseTypeBreakdown
                    data={paymentTypeData ?? []}
                    isLoading={paymentTypeLoading}
                />
            </div>
            <ReportFooter />
        </div>
    )
}
