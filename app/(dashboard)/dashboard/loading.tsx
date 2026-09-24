// Shown instantly while the dashboard's server data loads.
import { Skeleton } from "@/components/ui/skeleton"
import { CardSkeleton, StatCardsSkeleton } from "@/components/shared/skeletons"

export default function DashboardLoading() {
    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6 lg:p-8">
            <div className="space-y-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-40" />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <CardSkeleton chart className="lg:col-span-2" />
                <CardSkeleton chart />
            </div>
            <StatCardsSkeleton
                count={4}
                className="grid-cols-1 sm:grid-cols-4"
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    )
}
