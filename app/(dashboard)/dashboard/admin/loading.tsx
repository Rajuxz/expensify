// Shown instantly while the role check and users list load.
import { Skeleton } from "@/components/ui/skeleton"
import {
    PageHeaderSkeleton,
    TableSkeleton,
    TabsSkeleton,
} from "@/components/shared/skeletons"

export default function AdminLoading() {
    return (
        <div className="space-y-4">
            <PageHeaderSkeleton />
            <TabsSkeleton tabs={3} />
            <Skeleton className="h-8 w-64" />
            <TableSkeleton rows={6} columns={4} />
        </div>
    )
}
