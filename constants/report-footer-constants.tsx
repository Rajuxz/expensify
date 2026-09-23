import { CalendarDays, CalendarRange, Sun, TrendingUp } from "lucide-react"
export type Period = "daily" | "weekly" | "monthly" | "yearly"

export type CustomReportPeriod = "single-day" | "date-range"

export const reports: {
    period: Period
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
}[] = [
    {
        period: "daily",
        label: "Daily",
        description: "Today's expenses",
        icon: Sun,
    },
    {
        period: "weekly",
        label: "Weekly",
        description: "This week's breakdown",
        icon: CalendarDays,
    },
    {
        period: "monthly",
        label: "Monthly",
        description: "This month's breakdown",
        icon: CalendarRange,
    },
    {
        period: "yearly",
        label: "Yearly",
        description: "Full year summary",
        icon: TrendingUp,
    },
]

export const customReports: {
    period: CustomReportPeriod
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
}[] = [
    {
        period: "single-day",
        label: "One Day",
        description: "Pick any day for its breakdown",
        icon: CalendarDays,
    },
    {
        period: "date-range",
        label: "Date Range",
        description: "Pick 2–15 days for a combined report",
        icon: CalendarRange,
    },
]
