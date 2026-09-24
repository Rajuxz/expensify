// features/reports/types.ts
import type {
    getReportStats,
    getCashVsOnlineSplit,
    getSpendingPerCategory,
} from "@/actions/expense/stats"

export type ReportStats = Awaited<ReturnType<typeof getReportStats>>
export type PaymentTypeData = Awaited<ReturnType<typeof getCashVsOnlineSplit>>
export type CategoryData = Awaited<ReturnType<typeof getSpendingPerCategory>>
