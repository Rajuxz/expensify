// Shown instantly while expenses load. Mirrors the responsive switch in
// DataTable: card list on phones, table on md+.
import { Skeleton } from "@/components/ui/skeleton"
import { ListSkeleton, TableSkeleton } from "@/components/shared/skeletons"

export default function TransactionsLoading() {
    return (
        <div className="space-y-2 p-2">
            <Skeleton className="mb-2 h-7 w-32" />
            <div className="flex items-center justify-between gap-2 py-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-8 w-24 md:w-72" />
            </div>
            <ListSkeleton rows={6} className="md:hidden" />
            <TableSkeleton rows={10} columns={7} className="hidden md:block" />
            <div className="flex justify-between py-4">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-7 w-40" />
            </div>
        </div>
    )
}
