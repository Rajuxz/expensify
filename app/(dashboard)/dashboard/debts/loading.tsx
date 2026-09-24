// Shown instantly while debts (and their computed interest) load.
import {
    ListSkeleton,
    PageHeaderSkeleton,
    StatCardsSkeleton,
    TabsSkeleton,
} from "@/components/shared/skeletons"

export default function DebtsLoading() {
    return (
        <div className="space-y-4">
            <PageHeaderSkeleton action />
            <StatCardsSkeleton
                count={3}
                className="grid-cols-1 sm:grid-cols-3"
            />
            <TabsSkeleton tabs={2} />
            <ListSkeleton rows={4} />
        </div>
    )
}
