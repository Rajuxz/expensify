// Skeleton building blocks for route-level loading.tsx files. Each mirrors
// the size of the real UI it stands in for, so content doesn't jump when
// it arrives. Server components (no client JS).
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** Page title + subtitle, with an optional action button on the right. */
export function PageHeaderSkeleton({ action = false }: { action?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-2">
            <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            {action && <Skeleton className="h-8 w-28" />}
        </div>
    )
}

/** Row of StatCard placeholders. */
export function StatCardsSkeleton({
    count,
    className,
}: {
    count: number
    className?: string
}) {
    return (
        <div className={cn("grid gap-4", className)}>
            {Array.from({ length: count }, (_, i) => (
                <Card key={i}>
                    <CardContent className="space-y-2 pt-6">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-7 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

/** A titled card with a few lines (or a chart block) inside. */
export function CardSkeleton({
    lines = 3,
    chart = false,
    className,
}: {
    lines?: number
    chart?: boolean
    className?: string
}) {
    return (
        <Card className={className}>
            <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56 max-w-full" />
            </CardHeader>
            <CardContent className="space-y-3">
                {chart ? (
                    <Skeleton className="h-56 w-full" />
                ) : (
                    Array.from({ length: lines }, (_, i) => (
                        <div key={i} className="flex justify-between gap-4">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

/** Bordered table: header row + body rows. */
export function TableSkeleton({
    rows = 8,
    columns = 6,
    className,
}: {
    rows?: number
    columns?: number
    className?: string
}) {
    return (
        <div className={cn("rounded-md border", className)}>
            <div className="flex gap-4 border-b p-3">
                {Array.from({ length: columns }, (_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {Array.from({ length: rows }, (_, r) => (
                <div key={r} className="flex gap-4 border-b p-3 last:border-0">
                    {Array.from({ length: columns }, (_, c) => (
                        <Skeleton key={c} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    )
}

/** Stack of list cards (mobile expenses, debts list). */
export function ListSkeleton({
    rows = 5,
    className,
}: {
    rows?: number
    className?: string
}) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: rows }, (_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border p-4"
                >
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                </div>
            ))}
        </div>
    )
}

/** Tabs strip placeholder. */
export function TabsSkeleton({ tabs = 2 }: { tabs?: number }) {
    return (
        <div className="flex gap-2">
            {Array.from({ length: tabs }, (_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
            ))}
        </div>
    )
}
