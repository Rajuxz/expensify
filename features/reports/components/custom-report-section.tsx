"use client"

import { useState } from "react"
import { differenceInCalendarDays, format, startOfToday } from "date-fns"
import type { DateRange } from "react-day-picker"
import { ChevronDown } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    customReports,
    type CustomReportPeriod,
} from "@/constants/report-footer-constants"
import type { OnExport, ReportParams } from "@/lib/reports/pdf-export-config"
import ExportButtons from "./export-buttons"

const MIN_RANGE_DAYS = 2
const MAX_RANGE_DAYS = 15

type CustomReportsSectionProps = {
    title: string
    description: string
    loading: string | null
    onExport: OnExport
}

function rangeDays(range: DateRange | undefined) {
    if (!range?.from || !range?.to) return 0
    return differenceInCalendarDays(range.to, range.from) + 1
}

function CustomReportsSection({
    title,
    description,
    loading,
    onExport,
}: CustomReportsSectionProps) {
    const [openPeriod, setOpenPeriod] = useState<CustomReportPeriod | null>(
        null
    )
    const [singleDay, setSingleDay] = useState<Date | undefined>()
    const [range, setRange] = useState<DateRange | undefined>()
    const today = startOfToday()

    const days = rangeDays(range)
    const rangeValid = days >= MIN_RANGE_DAYS && days <= MAX_RANGE_DAYS

    // what the card shows, what the popover footer says, and what gets exported
    const state: Record<
        CustomReportPeriod,
        {
            summary: string | null
            hint: string
            params: ReportParams | null
            hasSelection: boolean
        }
    > = {
        "single-day": {
            summary: singleDay ? format(singleDay, "EEE, MMM d, yyyy") : null,
            hint: singleDay
                ? format(singleDay, "MMMM d, yyyy")
                : "Pick any day up to today",
            params: singleDay ? { date: singleDay } : null,
            hasSelection: !!singleDay,
        },
        "date-range": {
            summary:
                range?.from && range.to
                    ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`
                    : null,
            hint: !range?.from
                ? `Pick a start and end date (${MIN_RANGE_DAYS}–${MAX_RANGE_DAYS} days)`
                : !range.to
                  ? "Now pick an end date"
                  : rangeValid
                    ? `${days} days selected`
                    : `${days} ${days === 1 ? "day" : "days"} selected — choose ${MIN_RANGE_DAYS}–${MAX_RANGE_DAYS}`,
            params:
                rangeValid && range?.from && range.to
                    ? { from: range.from, to: range.to }
                    : null,
            hasSelection: !!range?.from,
        },
    }

    async function handleExport(
        period: CustomReportPeriod,
        fmt: "csv" | "pdf"
    ) {
        const params = state[period].params
        if (!params) return
        // keep the popover open (showing progress) until the export finishes
        await onExport(period, fmt, params)
        setOpenPeriod(null)
    }

    return (
        <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {customReports.map((report) => {
                    const Icon = report.icon
                    const { summary, hint, params, hasSelection } =
                        state[report.period]
                    const isOpen = openPeriod === report.period

                    return (
                        <Popover
                            key={report.period}
                            open={isOpen}
                            onOpenChange={(open) => {
                                // don't let the popover close mid-export
                                if (!open && loading) return
                                setOpenPeriod(open ? report.period : null)
                            }}
                        >
                            <PopoverTrigger
                                render={
                                    <button
                                        type="button"
                                        className={cn(
                                            "group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-foreground/20 hover:bg-muted/40",
                                            isOpen &&
                                                "border-foreground/20 bg-muted/40"
                                        )}
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium leading-none">
                                                {report.label}
                                            </p>
                                            <p
                                                className={cn(
                                                    "mt-1 truncate text-xs",
                                                    summary
                                                        ? "font-medium text-foreground"
                                                        : "text-muted-foreground"
                                                )}
                                            >
                                                {summary ?? report.description}
                                            </p>
                                        </div>
                                        <ChevronDown
                                            className={cn(
                                                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                                isOpen && "rotate-180"
                                            )}
                                        />
                                    </button>
                                }
                            />
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                {report.period === "single-day" ? (
                                    <Calendar
                                        mode="single"
                                        selected={singleDay}
                                        onSelect={setSingleDay}
                                        defaultMonth={singleDay}
                                        disabled={{ after: today }}
                                        endMonth={today}
                                    />
                                ) : (
                                    <Calendar
                                        mode="range"
                                        selected={range}
                                        onSelect={setRange}
                                        defaultMonth={
                                            range?.from ??
                                            new Date(
                                                today.getFullYear(),
                                                today.getMonth() - 1
                                            )
                                        }
                                        disabled={{ after: today }}
                                        endMonth={today}
                                        numberOfMonths={2}
                                    />
                                )}

                                <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
                                    <p
                                        className={cn(
                                            "text-xs",
                                            summary && !params
                                                ? "text-destructive"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {hint}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        {hasSelection && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-xs"
                                                disabled={loading !== null}
                                                onClick={() =>
                                                    report.period ===
                                                    "single-day"
                                                        ? setSingleDay(
                                                              undefined
                                                          )
                                                        : setRange(undefined)
                                                }
                                            >
                                                Clear
                                            </Button>
                                        )}
                                        <ExportButtons
                                            period={report.period}
                                            loading={loading}
                                            onExport={handleExport}
                                            disabled={!params}
                                        />
                                    </div>
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
