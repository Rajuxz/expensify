"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getDailyReportData, getWeeklyReport } from "@/actions/reports"
import { cn } from "@/lib/utils"

import { FileSpreadsheet, FileText } from "lucide-react"
import { toast } from "sonner"

import { reports, Period } from "@/constants/report-footer-constants"
import getCurrentWeek from "@/lib/helpers/getCurrentWeek"
export function ReportFooter() {
    const [loading, setLoading] = useState<string | null>(null)

    async function handleExport(period: Period, format: "csv" | "pdf") {
        const key = `${period}-${format}`
        setLoading(key)

        try {
            if (period === "daily" && format === "pdf") {
                const data = await getDailyReportData()

                if (data.rows.length === 0) {
                    toast.error("No expenses recorded today.")
                    return
                }

                const { generateDailyReportPdf } =
                    await import("@/lib/pdf/daily-report")
                generateDailyReportPdf(data)
                toast.success("PDF downloaded.")
                return
            } else if (period === "weekly" && format === "pdf") {
                const { fromDate, toDate } = getCurrentWeek()
                const data = await getWeeklyReport(fromDate, toDate)
                if (data.rows.length === 0) {
                    toast.error("No expenses recorded this week.")
                    return
                }
                const { generateWeeklyReportPdf } =
                    await import("@/lib/pdf/weekly-report")

                generateWeeklyReportPdf(data)
                toast.success("Pdf downloaded.")
                return
            }

            // other period/format combinations go here as you build them
            toast.error("This report type isn't available yet.")
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong generating the report.")
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="border-t pt-5 space-y-4">
            <div>
                <h3 className="text-sm font-semibold">Download reports</h3>
                <p className="text-xs text-muted-foreground">
                    Export your expense data by period.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reports.map(({ period, label, description, icon: Icon }) => (
                    <div
                        key={period}
                        className="group flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors hover:border-foreground/20 hover:bg-muted/40"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium leading-none">
                                    {label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={loading !== null}
                                onClick={() => handleExport(period, "csv")}
                                className={cn(
                                    "h-8 px-2.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50",
                                    "dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                                )}
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">
                                    {loading === `${period}-csv`
                                        ? "..."
                                        : "CSV"}
                                </span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={loading !== null}
                                onClick={() => handleExport(period, "pdf")}
                                className={cn(
                                    "h-8 px-2.5 text-rose-700 hover:text-rose-800 hover:bg-rose-50",
                                    "dark:text-rose-400 dark:hover:bg-rose-950/40"
                                )}
                            >
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">
                                    {loading === `${period}-pdf`
                                        ? "..."
                                        : "PDF"}
                                </span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
