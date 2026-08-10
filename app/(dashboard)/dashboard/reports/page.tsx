"use client"
import { useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { Download } from "lucide-react"
import { PlaceholderCard } from "@/components/shared/placeholder-card"

const dateRanges = ["This Week", "This Month", "Last Month", "This Year"]

export default function ExpenseReport() {
    const [range, setRange] = useState("This Month")

    // Placeholder data — replace with real aggregation (API/Server Action)
    const summary = {
        total: 45230,
        income: 60000,
        expenseCount: 32,
        avgPerDay: 1500,
    }

    const categoryBreakdown = [
        { name: "Food", amount: 15000 },
        { name: "Transport", amount: 8000 },
        { name: "Rent", amount: 20000 },
        { name: "Other", amount: 2230 },
    ]

    const paymentTypeBreakdown = [
        { type: "CASH", amount: 18000 },
        { type: "ONLINE", amount: 27230 },
    ]

    const handleExport = () => {
        // TODO: generate CSV/PDF export
        console.log("exporting report for", range)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Report</h2>
                <div className="flex items-center gap-2">
                    <Combobox items={dateRanges} value={range}>
                        <ComboboxInput placeholder="Select range" />
                        <ComboboxContent>
                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                            <ComboboxList>
                                {(item) => (
                                    <ComboboxItem key={item} value={item}>
                                        {item}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-1" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PlaceholderCard
                    title={"Total Amount Spent"}
                    message={"Test"}
                    className="h-14"
                />
                <PlaceholderCard
                    title={"This month"}
                    message={"Test"}
                    className="h-14"
                />
                <PlaceholderCard
                    title={"Total Transaction"}
                    message={"Test1"}
                    className="h-14"
                />
                <PlaceholderCard
                    title={"Avg / Day"}
                    message={"Test2"}
                    className="h-14"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>By Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder — swap for a chart (e.g. recharts pie/bar) */}
                        <div className="space-y-2">
                            {categoryBreakdown.map((item) => (
                                <div
                                    key={item.name}
                                    className="flex justify-between text-sm"
                                >
                                    <span>{item.name}</span>
                                    <span className="font-medium">
                                        Rs. {item.amount.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>By Payment Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {paymentTypeBreakdown.map((item) => (
                                <div
                                    key={item.type}
                                    className="flex justify-between text-sm"
                                >
                                    <span>{item.type}</span>
                                    <span className="font-medium">
                                        Rs. {item.amount.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
