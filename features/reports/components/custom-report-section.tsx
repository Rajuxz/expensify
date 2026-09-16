// features/reports/components/custom-reports-section.tsx
"use client"

import { useState } from "react"
import { format, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
    customReports,
    type CustomReportPeriod,
} from "@/constants/report-footer-constants"

import type { OnExport } from "@/lib/reports/pdf-export-config"

type ExportRange = { from: Date; to: Date }

type CustomReportsSectionProps = {
    title: string
    description: string
    loading: string | null
    onExport: OnExport
}

const today = new Date()
today.setHours(0, 0, 0, 0)
const yesterday = subDays(today, 1)

function isValidRange(range: DateRange | undefined) {
    if (!range?.from || !range?.to) return false
    const days =
        Math.round((range.to.getTime() - range.from.getTime()) / 86_400_000) + 1
    return days >= 2 && days <= 15
}

function CustomReportsSection({
    loading,
    onExport,
}: CustomReportsSectionProps) {
    const [openPeriod, setOpenPeriod] = useState<CustomReportPeriod | null>(
        null
    )
    const [singleDay, setSingleDay] = useState<Date | undefined>()
    const [range, setRange] = useState<DateRange | undefined>()

    const handleExport = (period: CustomReportPeriod, fmt: "csv" | "pdf") => {
        if (period === "single-day" && singleDay) {
            onExport(period, fmt, { date: singleDay })
        }
        if (period === "date-range" && isValidRange(range)) {
            onExport(period, fmt, { from: range!.from!, to: range!.to! })
        }
        setOpenPeriod(null)
    }

    return (
        <div>
            <h3 className="text-sm font-semibold">Custom Reports</h3>
            <p className="text-xs text-muted-foreground">
                Export a report for a specific day or a custom range
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customReports.map((report) => {
                    const Icon = report.icon
                    const isSingleDay = report.period === "single-day"
                    const canExport = isSingleDay
                        ? !!singleDay
                        : isValidRange(range)

                    return (
                        <Popover
                            key={report.period}
                            open={openPeriod === report.period}
                            onOpenChange={(open) =>
                                setOpenPeriod(open ? report.period : null)
                            }
                        >
                            <PopoverTrigger
                                render={
                                    <button
                                        type="button"
                                        className="flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent"
                                    >
                                        <Icon className="size-5 text-muted-foreground shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {report.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {report.description}
                                            </p>
                                        </div>
                                    </button>
                                }
                            />
                            <PopoverContent
                                className="w-auto p-3"
                                align="start"
                            >
                                {isSingleDay ? (
                                    <Calendar
                                        mode="single"
                                        selected={singleDay}
                                        onSelect={setSingleDay}
                                        disabled={{ after: yesterday }}
                                    />
                                ) : (
                                    <>
                                        <Calendar
                                            mode="range"
                                            selected={range}
                                            onSelect={setRange}
                                            disabled={{ after: today }}
                                            min={2}
                                            max={15}
                                            numberOfMonths={2}
                                        />
                                        <p className="text-xs text-muted-foreground pt-2">
                                            {range?.from && range?.to
                                                ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`
                                                : "Select 2–15 days"}
                                        </p>
                                    </>
                                )}

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={
                                            !canExport ||
                                            loading === report.period
                                        }
                                        onClick={() =>
                                            handleExport(report.period, "csv")
                                        }
                                    >
                                        CSV
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={
                                            !canExport ||
                                            loading === report.period
                                        }
                                        onClick={() =>
                                            handleExport(report.period, "pdf")
                                        }
                                    >
                                        PDF
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )
                })}
            </div>
        </div>
    )
}

export default CustomReportsSection
