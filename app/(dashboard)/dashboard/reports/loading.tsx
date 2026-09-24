// Shown instantly while report stats load.
import { Skeleton } from "@/components/ui/skeleton"
import {
    CardSkeleton,
    PageHeaderSkeleton,
    StatCardsSkeleton,
} from "@/components/shared/skeletons"

export default function ReportsLoading() {
    return (
        <div className="space-y-4">
            <PageHeaderSkeleton action />
            <StatCardsSkeleton
                count={5}
                className="grid-cols-2 md:grid-cols-5"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CardSkeleton lines={4} />
                <CardSkeleton lines={2} />
            </div>
            <div className="space-y-3 border-t pt-5">
                <Skeleton className="h-4 w-32" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Array.from({ length: 6 }, (_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}
