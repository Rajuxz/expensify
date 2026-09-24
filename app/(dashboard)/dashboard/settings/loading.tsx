// Shown briefly while the settings route loads.
import { Skeleton } from "@/components/ui/skeleton"
import { CardSkeleton } from "@/components/shared/skeletons"

export default function SettingsLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-6 w-28" />
            <CardSkeleton lines={2} />
            <CardSkeleton lines={5} />
            <CardSkeleton lines={2} />
        </div>
    )
}
