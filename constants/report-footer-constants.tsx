import { CalendarDays, CalendarRange, Sun, TrendingUp } from "lucide-react"
export type Period = "daily" | "weekly" | "monthly" | "yearly"

export const reports: {
    period: Period
    label: string
    description: string
    icon: React.ElementType
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
