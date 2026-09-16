"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    getDailyReportData,
    getMonthlyReport,
    getWeeklyReport,
    getYearlyReport,
} from "@/actions/reports"
import { cn } from "@/lib/utils"

import { FileSpreadsheet, FileText } from "lucide-react"
import { toast } from "sonner"
import { reports, Period } from "@/constants/report-footer-constants"
import getCurrentWeek from "@/lib/helpers/getCurrentWeek"

type ReportRowProps = {
    period: Period
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    loading: string | null
    onExport: (period: Period, format: "csv" | "pdf") => void
}

function ReportRow({
    period,
    label,
    description,
    icon: Icon,
    loading,
    onExport,
}: ReportRowProps) {
    return (
        <div className="group flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors hover:border-foreground/20 hover:bg-muted/40">
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">{label}</p>
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
                    onClick={() => onExport(period, "csv")}
                    className={cn(
                        "h-8 px-2.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50",
                        "dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                    )}
                >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">
                        {loading === `${period}-csv` ? "..." : "CSV"}
                    </span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading !== null}
                    onClick={() => onExport(period, "pdf")}
                    className={cn(
                        "h-8 px-2.5 text-rose-700 hover:text-rose-800 hover:bg-rose-50",
                        "dark:text-rose-400 dark:hover:bg-rose-950/40"
                    )}
                >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">
                        {loading === `${period}-pdf` ? "..." : "PDF"}
                    </span>
                </Button>
            </div>
        </div>
    )
}

function ReportSection({
    title,
    description,
    loading,
    onExport,
}: {
    title: string
    description: string
    loading: string | null
    onExport: (period: Period, format: "csv" | "pdf") => void
}) {
    return (
        <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reports.map((r) => (
                    <ReportRow
                        key={r.period}
                        {...r}
                        loading={loading}
                        onExport={onExport}
                    />
                ))}
            </div>
        </div>
    )
}
