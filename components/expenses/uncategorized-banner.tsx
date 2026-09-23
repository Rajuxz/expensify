"use client"
import { CheckCircle2, Tags } from "lucide-react"
import { Button } from "@/components/ui/button"
import pluralize from "@/lib/helpers/pluralize"

type UncategorizedBannerProps = {
    count: number
    active: boolean // table is currently filtered to uncategorized
    editing: boolean
    onCategorize: () => void
    onShowAll: () => void
}

export function UncategorizedBanner({
    count,
    active,
    editing,
    onCategorize,
    onShowAll,
}: UncategorizedBannerProps) {
    if (count === 0 && !active) return null

    if (count === 0) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    All caught up — every expense has a category.
                </span>
                <Button variant="ghost" size="sm" onClick={onShowAll}>
                    Show all expenses
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <span className="flex items-center gap-2">
                <Tags className="h-4 w-4" />
                {active
                    ? `Showing ${pluralize(count, "uncategorized expense")}.${editing ? " Pick a category for each, then save." : ""}`
                    : `${pluralize(count, "expense")} ${count === 1 ? "is" : "are"} uncategorized.`}
            </span>
            <div className="flex items-center gap-1">
                {active && (
                    <Button variant="ghost" size="sm" onClick={onShowAll}>
                        Show all expenses
                    </Button>
                )}
                {!editing && (
                    <Button variant="outline" size="sm" onClick={onCategorize}>
                        Categorize now
                    </Button>
                )}
            </div>
        </div>
    )
}
