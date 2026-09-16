// lib/reports/pdf-export-config.ts

import { Period } from "@/constants/report-footer-constants"
import { CustomReportPeriod } from "@/constants/report-footer-constants"

import {
    getDailyReportData,
    getWeeklyReport,
    getMonthlyReport,
    getYearlyReport,
} from "@/actions/reports"

import getCurrentWeek from "@/lib/helpers/getCurrentWeek"

export type ReportPeriod = Period | CustomReportPeriod

export type ReportParams = {
    date?: Date
    from?: Date
    to?: Date
}

export type OnExport = (
    period: ReportPeriod,
    format: "csv" | "pdf",
    params?: ReportParams
) => void | Promise<void>

type PdfExportConfig<T> = {
    fetchData: (params?: ReportParams) => Promise<{ rows: unknown[] } & T>
    generatePdf: () => Promise<{
        generate: (data: { rows: unknown[] } & T) => void
    }>
    emptyMessage: string
}

const pdfExportConfig: Record<ReportPeriod, PdfExportConfig<any>> = {
    daily: {
        fetchData: () => getDailyReportData(),
        generatePdf: () =>
            import("@/lib/pdf/daily-report").then((m) => ({
                generate: m.generateDailyReportPdf,
            })),
        emptyMessage: "No expenses recorded today.",
    },
    "single-day": {
        fetchData: (params) => {
            if (!params?.date) {
                throw new Error("A date is required for single-day reports.")
            }
            return getDailyReportData(params.date)
        },
        generatePdf: () =>
            import("@/lib/pdf/daily-report").then((m) => ({
                generate: m.generateDailyReportPdf,
            })),
        emptyMessage: "No expenses recorded on the selected day.",
    },
    weekly: {
        fetchData: () => {
            const { fromDate, toDate } = getCurrentWeek()
            return getWeeklyReport(fromDate, toDate)
        },
        generatePdf: () =>
            import("@/lib/pdf/weekly-report").then((m) => ({
                generate: m.generateWeeklyReportPdf,
            })),
        emptyMessage: "No expenses recorded this week.",
    },
    "date-range": {
        fetchData: (params) => {
            if (!params?.from || !params?.to) {
                throw new Error("A date range is required.")
            }
            return getWeeklyReport(params.from, params.to)
        },
        generatePdf: () =>
            import("@/lib/pdf/weekly-report").then((m) => ({
                generate: m.generateWeeklyReportPdf,
            })),
        emptyMessage: "No expenses recorded in the selected range.",
    },
    monthly: {
        fetchData: () => {
            const now = new Date()
            return getMonthlyReport(now.getFullYear(), now.getMonth() + 1)
        },
        generatePdf: () =>
            import("@/lib/pdf/monthly-report").then((m) => ({
                generate: m.generateMonthlyReportPdf,
            })),
        emptyMessage: "No expenses recorded this month.",
    },
    yearly: {
        fetchData: () => getYearlyReport(new Date().getFullYear()),
        generatePdf: () =>
            import("@/lib/pdf/yearly-report").then((m) => ({
                generate: m.generateYearlyReportPdf,
            })),
        emptyMessage: "No expenses recorded this year.",
    },
}

export default pdfExportConfig
