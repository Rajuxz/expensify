"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import useSWR from "swr"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { getWeeklySpendingTrend } from "@/actions/expense"
const chartConfig = {
    total: {
        label: "Spent",
        color: "var(--chart-1)",
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
        <ChartContainer config={chartConfig} className="h-70 w-full p-3">
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
                    tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip
                    cursor={{ fill: "var(--muted)" }}
                    content={
                        <ChartTooltipContent
                            formatter={(value) => [
                                `Rs. ${Number(value).toFixed(2)}`,
                            ]}
                        />
                    }
                />
                <Bar
                    dataKey="total"
                    fill="#D97706"
                    barSize={22}
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ChartContainer>
    )
}
