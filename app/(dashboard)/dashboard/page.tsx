// app/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    CashVsOnlineChart,
    WeeklySpendingChart,
} from "@/components/dashboard/dashboard-charts"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { PlaceholderCard } from "@/components/shared/placeholder-card"
import {
    getAverageDailySpend,
    getCashVsOnlineSplit,
    getMonthlyExpense,
    getMonthOverMonthComparison,
    getWeeklyExpense,
} from "@/actions/expense/stats"
import { MonthComparisonCard } from "@/components/dashboard/month-comparison-card"
const Dashboard = async () => {
    const now = new Date()
    // each stat computes its own period in the user's timezone
    const [
        avgPerDay,
        splitData,
        weeklySpending,
        monthlySpending,
        monthComparison,
    ] = await Promise.all([
        getAverageDailySpend(),
        getCashVsOnlineSplit(),
        getWeeklyExpense(),
        getMonthlyExpense(),
        getMonthOverMonthComparison(),
    ])
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <DashboardHeader now={now} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Spending this week</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Daily total, Sunday to Saturday
                        </p>
                    </CardHeader>
                    <CardContent>
                        <WeeklySpendingChart />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cash vs. online</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Split by transaction type
                        </p>
                    </CardHeader>
                    <CardContent>
                        <CashVsOnlineChart data={splitData} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <StatCard label="This month" value={`Rs. ${monthlySpending}`} />
                <StatCard label="This week" value={`Rs. ${weeklySpending}`} />
                <StatCard
                    label="Avg per day"
                    value={`Rs. ${avgPerDay.toFixed(2)} `}
                />
                <MonthComparisonCard {...monthComparison} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PlaceholderCard
                    className="lg:col-span-2 min-h-75"
                    title="Recent expenses"
                    message="Expense table coming soon"
                />
                <PlaceholderCard
                    className="min-h-75"
                    title="Filter by date"
                    message="Calendar filter coming soon"
                />
            </div>
        </div>
    )
}

export default Dashboard
