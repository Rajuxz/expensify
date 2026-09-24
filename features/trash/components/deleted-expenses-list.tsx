"use client"
// "Recently deleted" list: restore or permanently delete, one row or many.
// Rows are plain flex rows, so the same markup works on phones and desktop.
import { useState, useTransition } from "react"
import { format, formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import pluralize from "@/lib/helpers/pluralize"
import { sumAmounts } from "@/lib/money"
import {
    purgeExpenses,
    restoreExpenses,
    type DeletedExpense,
} from "@/actions/expense/archive"
import { PurgeConfirmDialog } from "./purge-confirm-dialog"

export function DeletedExpensesList({
    expenses,
}: {
    expenses: DeletedExpense[]
}) {
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [isPending, startTransition] = useTransition()

    // ignore ids that disappeared after a refresh
    const selectedIds = expenses
        .filter((e) => selected.has(e.id))
        .map((e) => e.id)
    const allSelected =
        expenses.length > 0 && selectedIds.length === expenses.length

    function toggle(id: string, checked: boolean) {
        setSelected((prev) => {
            const next = new Set(prev)
            if (checked) next.add(id)
            else next.delete(id)
            return next
        })
    }

    function restore(ids: string[]) {
        startTransition(async () => {
            const result = await restoreExpenses(ids)
            if (!result.success) {
                toast.error(result.error ?? "Could not restore.")
                return
            }
            toast.success(
                `Restored ${pluralize(result.count ?? 0, "expense")}.`
            )
            setSelected(new Set())
        })
    }

    // returns true on success so the confirm dialog can close
    function purge(ids: string[]) {
        return new Promise<boolean>((resolve) => {
            startTransition(async () => {
                const result = await purgeExpenses(ids)
                if (!result.success) {
                    toast.error(result.error ?? "Could not delete.")
                    resolve(false)
                    return
                }
                toast.success(
                    `Deleted ${pluralize(result.count ?? 0, "expense")} forever.`
                )
                setSelected(new Set())
                resolve(true)
            })
        })
    }

    if (expenses.length === 0) {
        return (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                Nothing here. Expenses you delete show up here, and you can
                restore them any time.
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* toolbar: select all + actions on the selection */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                        checked={allSelected}
                        indeterminate={selectedIds.length > 0 && !allSelected}
                        onCheckedChange={(checked) =>
                            setSelected(
                                checked
                                    ? new Set(expenses.map((e) => e.id))
                                    : new Set()
                            )
                        }
                    />
                    {selectedIds.length
                        ? `${selectedIds.length} selected`
                        : "Select all"}
                </label>
                {selectedIds.length > 0 && (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => restore(selectedIds)}
                        >
                            <RotateCcw className="mr-1 h-4 w-4" />
                            Restore ({selectedIds.length})
                        </Button>
                        <PurgeConfirmDialog
                            count={selectedIds.length}
                            pending={isPending}
                            onConfirm={() => purge(selectedIds)}
                            trigger={
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive"
                                    disabled={isPending}
                                >
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Delete forever
                                </Button>
                            }
                        />
                    </div>
                )}
            </div>

            <ul className="divide-y rounded-xl border">
                {expenses.map((e) => (
                    <li
                        key={e.id}
                        className={cn(
                            "flex items-center gap-3 p-3",
                            selected.has(e.id) && "bg-muted"
                        )}
                    >
                        <Checkbox
                            checked={selected.has(e.id)}
                            onCheckedChange={(checked) => toggle(e.id, checked)}
                            aria-label={`Select ${e.title}`}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{e.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                                {[
                                    e.category ?? "Uncategorized",
                                    format(
                                        new Date(e.expense_date),
                                        "MMM d, yyyy"
                                    ),
                                    e.deleted_at &&
                                        `deleted ${formatDistanceToNow(new Date(e.deleted_at), { addSuffix: true })}`,
                                ]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </p>
                        </div>
                        <p className="shrink-0 font-semibold">
                            Rs. {e.amount.toLocaleString()}
                        </p>
                        <div className="flex shrink-0 gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-9 sm:size-7"
                                disabled={isPending}
                                onClick={() => restore([e.id])}
                            >
                                <RotateCcw className="h-4 w-4" />
                                <span className="sr-only">
                                    Restore {e.title}
                                </span>
                            </Button>
                            <PurgeConfirmDialog
                                count={1}
                                pending={isPending}
                                onConfirm={() => purge([e.id])}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="size-9 text-muted-foreground hover:text-destructive sm:size-7"
                                        disabled={isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">
                                            Delete {e.title} forever
                                        </span>
                                    </Button>
                                }
                            />
                        </div>
                    </li>
                ))}
            </ul>

            <p className="text-right text-xs text-muted-foreground">
                {pluralize(expenses.length, "deleted expense")} · Rs.{" "}
                {sumAmounts(expenses.map((e) => e.amount)).toLocaleString()}{" "}
                (not counted in your totals)
            </p>
        </div>
    )
}
