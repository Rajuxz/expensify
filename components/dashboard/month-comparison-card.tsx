// components/dashboard/month-comparison-card.tsx
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Props = {
    current: number
    previous: number
    percentChange: number | null
    trend: "up" | "down" | "flat"
}

export function MonthComparisonCard({
    current,
    previous,
    percentChange,
    trend,
}: Props) {
    const Icon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus

    // for spending, "up" (spending more) is the concerning direction —
    // color accordingly without using pure red/green
    const trendColor =
        trend === "up"
            ? "text-amber-600"
            : trend === "down"
              ? "text-indigo-600"
              : "text-muted-foreground"

    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                    This month vs. last
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-semibold tracking-tight">
                        Rs. {current.toFixed(0)}
                    </p>
                    {percentChange !== null && (
                        <span
                            className={cn(
                                "flex items-center gap-0.5 text-sm font-medium",
                                trendColor
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {Math.abs(percentChange).toFixed(0)}%
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    vs. Rs. {previous.toFixed(0)} last month
                </p>
            </CardContent>
        </Card>
    )
}
