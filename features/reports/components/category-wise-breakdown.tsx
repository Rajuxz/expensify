import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
type CategoryBreakdownItem = {
    categoryId: string
    name: string
    total: number
}

type ExpenseCategoryBreakdownProps = {
    data: CategoryBreakdownItem[]
    isLoading?: boolean
}
const CategoryWiseBreakdown = ({
    data,
    isLoading = false,
}: ExpenseCategoryBreakdownProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>By Category</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Placeholder — swap for a chart (e.g. recharts pie/bar) */}
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                ) : data.length === 0 ? (
                    <div
                        aria-label="No category expenses recorded yet"
                        className="mx-auto h-40 w-40 rounded-full"
                        role="img"
                        style={{
                            background:
                                "conic-gradient(var(--muted) 0 25%, var(--muted-foreground) 25% 50%, var(--muted) 50% 75%, var(--muted-foreground) 75%)",
                        }}
                    />
                ) : (
                    <div className="space-y-2">
                        {data.map((item) => (
                            <div
                                key={item.name}
                                className="flex justify-between text-sm"
                            >
                                <span>{item.name}</span>
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

export default CategoryWiseBreakdown
