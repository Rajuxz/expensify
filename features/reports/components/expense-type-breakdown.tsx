import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card"
import { TransactionTypes } from "@/lib/generated/prisma/enums"

type PaymentTypeBreakdownItem = {
    type: TransactionTypes
    total: number
}

type ExpenseTypeBreakdownProps = {
    data: PaymentTypeBreakdownItem[]
    isLoading?: boolean
}

const ExpenseTypeBreakdown = ({
    data,
    isLoading = false,
}: ExpenseTypeBreakdownProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>By Payment Type</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                ) : data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No expenses recorded yet.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {data.map((item) => (
                            <div
                                key={item.type}
                                className="flex justify-between text-sm"
                            >
                                <span>{item.type}</span>
                                <span className="font-medium">
                                    Rs. {item.total.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default ExpenseTypeBreakdown
