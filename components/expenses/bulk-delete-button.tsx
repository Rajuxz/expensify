"use client"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { AlertTriangle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import AppDialog from "@/components/shared/app-dialog"
import { bulkSoftDeleteExpenses } from "@/actions/expense"
import { Expense } from "@/types/expenseTableTypes"
import pluralize from "@/lib/helpers/pluralize"

const PREVIEW_COUNT = 5

type BulkDeleteButtonProps = {
    expenses: Expense[]
    onDeleted: () => void
}

export function BulkDeleteButton({
    expenses,
    onDeleted,
}: BulkDeleteButtonProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const count = expenses.length
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const hidden = count - PREVIEW_COUNT

    function handleDelete() {
        startTransition(async () => {
            try {
                const result = await bulkSoftDeleteExpenses(
                    expenses.map((e) => e.id)
                )
                if (!result.success) {
                    toast.error(result.error ?? "Failed to delete expenses.")
                    return
                }
                toast.success(
                    `Deleted ${pluralize(result.count ?? 0, "expense")}.`
                )
                setOpen(false)
                onDeleted()
            } catch {
                toast.error("Failed to delete expenses.")
            }
        })
    }

    return (
        <AppDialog
            open={open}
            // don't let the dialog close mid-delete
            onOpenChange={(next) => !isPending && setOpen(next)}
            trigger={
                <Button variant="destructive" size="sm" disabled={count === 0}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete ({count})
                </Button>
            }
            title={`Delete ${pluralize(count, "expense")}?`}
            description={`Rs. ${total.toLocaleString()} in total.`}
        >
            <div className="space-y-4 text-sm">
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                    {expenses.slice(0, PREVIEW_COUNT).map((e) => (
                        <li key={e.id} className="flex justify-between gap-3">
                            <span className="truncate">{e.title}</span>
                            <span className="shrink-0 text-muted-foreground">
                                Rs. {Number(e.amount).toLocaleString()}
                            </span>
                        </li>
                    ))}
                    {hidden > 0 && (
                        <li className="text-muted-foreground">
                            …and {hidden} more
                        </li>
                    )}
                </ul>

                <div className="flex gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <ul className="list-disc space-y-1 pl-4">
                        <li>
                            They will disappear from this table, the dashboard
                            totals, reports and PDF exports.
                        </li>
                        <li>
                            Your spending totals will drop by Rs.{" "}
                            {total.toLocaleString()}.
                        </li>
                        <li>
                            There is no way to restore them from the app yet.
                        </li>
                    </ul>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending
                            ? "Deleting..."
                            : `Delete ${pluralize(count, "expense")}`}
                    </Button>
                </div>
            </div>
        </AppDialog>
    )
}
