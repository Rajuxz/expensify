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
            </CardContent>
        </Card>
    )
}

export default CategoryWiseBreakdown
