// Shown instantly while deleted expenses load.
import { Skeleton } from "@/components/ui/skeleton"
import { ListSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons"

export default function DeletedExpensesLoading() {
    return (
        <div className="space-y-4 p-2">
            <Skeleton className="h-4 w-20" />
            <PageHeaderSkeleton />
            <Skeleton className="h-5 w-28" />
            <ListSkeleton rows={5} />
        </div>
    )
}
