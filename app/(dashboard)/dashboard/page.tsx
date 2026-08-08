import { WeeklySpendingChart } from "@/components/dashboard/dashboard-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStartOfWeek } from "@/lib/helpers/getStartOfWeek"

const Dashboard = () => {
    const now = new Date()

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                    {now.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                    })}
                    {" · "}Here&apos;s where your money went this week
                </p>
            </div>

            {/* Spending chart + cash/online split — side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Spending this week</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Daily total, Sunday to Saturday
                        </p>
                    </CardHeader>
                    <CardContent>
                        <WeeklySpendingChart weekStart={getStartOfWeek(now)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cash vs. online</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Split by transaction type
                        </p>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center min-h-60">
                        <p className="text-sm text-muted-foreground">
                            Pie chart coming soon
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Stat cards — placeholders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <PlaceholderCard label="This month" />
                <PlaceholderCard label="This week" />
                <PlaceholderCard label="Avg per day" />
            </div>

            {/* Table + calendar filter — placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="h-full min-h-75">
                        <CardHeader>
                            <CardTitle>Recent expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Expense table coming soon
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="h-full min-h-75">
                        <CardHeader>
                            <CardTitle>Filter by date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Calendar filter coming soon
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function PlaceholderCard({ label }: { label: string }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold tracking-tight mt-1 text-muted-foreground/50">
                    —
                </p>
            </CardContent>
        </Card>
    )
}

export default Dashboard
