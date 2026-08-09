import { Card, CardContent } from "@/components/ui/card"

export function StatCard({
    label,
    value = "—",
}: {
    label: string
    value?: string
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold tracking-tight mt-1 text-muted-foreground/50">
                    {value}
                </p>
            </CardContent>
        </Card>
    )
}
