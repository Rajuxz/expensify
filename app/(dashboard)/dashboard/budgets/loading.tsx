// Shown briefly while the budgets route loads.
import { CardSkeleton, PageHeaderSkeleton } from "@/components/shared/skeletons"

export default function BudgetsLoading() {
    return (
        <div className="space-y-4">
            <PageHeaderSkeleton action />
            <CardSkeleton lines={1} />
            <CardSkeleton lines={4} />
        </div>
    )
}
