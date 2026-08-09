"use client"

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts"
import useSWR from "swr"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { getWeeklySpendingTrend } from "@/actions/expense"

// ---- Weekly spending (bar chart) ----

const weeklyChartConfig = {
    total: {
        label: "Spent",
        color: "#D97706",
    },
} satisfies ChartConfig

export function WeeklySpendingChart({ weekStart }: { weekStart: Date }) {
    const { data, isLoading } = useSWR(
        ["weekly-trend", weekStart.toISOString()],
        () => getWeeklySpendingTrend(weekStart)
    )

    if (isLoading || !data)
        return <div className="h-64 animate-pulse bg-muted rounded-lg" />

    return (
        <ChartContainer config={weeklyChartConfig} className="h-70 w-full p-3">
            <BarChart data={data}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `Rs. ${value}`}
                />
                <ChartTooltip
                    cursor={{ fill: "var(--muted)" }}
                    content={
                        <ChartTooltipContent
                            formatter={(value) => [
                                `Rs. ${Number(value).toFixed(2)}`,
                                "Spent",
                            ]}
                        />
                    }
                />
                <Bar
                    dataKey="total"
                    fill="var(--color-total)"
                    barSize={22}
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    )
}

// ---- Cash vs. online (pie chart) ----
const FALLBACK_COLOR = "#94A3B8"

const splitChartConfig = {
    cash: { label: "Cash", color: "#6366F1" },
    online: { label: "Online", color: "#E0A340" },
} satisfies ChartConfig

type SplitDatum = { type: string; total: number }

function resolveColor(type: string) {
    const key = type.toLowerCase() as keyof typeof splitChartConfig
    return splitChartConfig[key]?.color ?? FALLBACK_COLOR
}

export function CashVsOnlineChart({ data }: { data: SplitDatum[] }) {
    const chartData = data.map((d) => ({
        category: d.type.toLowerCase(),
        total: d.total,
        fill: resolveColor(d.type),
    }))
    console.log("config keys:", Object.keys(splitChartConfig))
    return (
        <ChartContainer config={splitChartConfig} className="h-60 w-full">
            <PieChart>
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(value) => [
                                `Rs. ${Number(value).toFixed(0)}`,
                            ]}
                        />
                    }
                />
                <Pie
                    data={chartData}
                    dataKey="total"
                    nameKey="category"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={4}
                />
                <ChartLegend
                    content={<ChartLegendContent nameKey="category" />}
                />
            </PieChart>
        </ChartContainer>
    )
}
