// Shown instantly while one debt, its payments and timeline load.
import { Skeleton } from "@/components/ui/skeleton"
import {
    CardSkeleton,
    PageHeaderSkeleton,
    TableSkeleton,
} from "@/components/shared/skeletons"

export default function DebtLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-4 w-20" />
            <PageHeaderSkeleton action />
            <div className="grid gap-4 lg:grid-cols-2">
                <CardSkeleton lines={5} />
                <div className="space-y-4">
                    <CardSkeleton lines={3} />
                    <CardSkeleton lines={2} />
                </div>
            </div>
            <CardSkeleton lines={3} />
            <TableSkeleton rows={5} columns={5} />
        </div>
    )
}
