import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PlaceholderCard({
    title,
    subtitle,
    message,
    className,
}: {
    title: string
    subtitle?: string
    message: string
    className?: string
}) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-50">
                <p className="text-sm text-muted-foreground">{message}</p>
            </CardContent>
        </Card>
    )
}
