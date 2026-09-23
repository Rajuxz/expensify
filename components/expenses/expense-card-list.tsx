"use client"
// Small-screen view of the expenses table: one card per row.
// Reads the same TanStack table as the desktop view, so filters, selection,
// pagination and bulk edit all stay in sync — this only changes the layout.
import type { ReactNode } from "react"
import type { Table } from "@tanstack/react-table"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Expense } from "@/types/expenseTableTypes"
import pluralize from "@/lib/helpers/pluralize"
import { ExpenseRowMenu } from "./expense-row-menu"

type ExpenseCardListProps<TData extends Expense> = {
    table: Table<TData>
    // set while bulk-editing categories; replaces the category text
    renderCategoryEditor: ((expense: TData) => ReactNode) | null
    isChanged: (expense: TData) => boolean
    totalLabel: string
    total: number
}

export function ExpenseCardList<TData extends Expense>({
    table,
    renderCategoryEditor,
    isChanged,
    totalLabel,
    total,
}: ExpenseCardListProps<TData>) {
    const rows = table.getRowModel().rows
    const editing = renderCategoryEditor !== null
    const selectable = !editing
    const rowCount = table.getFilteredRowModel().rows.length

    return (
        <div className="space-y-2">
            {/* summary line replaces the desktop table footer */}
            <div className="flex items-center justify-between gap-2 px-1 text-sm">
                {selectable && rows.length > 0 ? (
                    <label className="flex items-center gap-2 text-muted-foreground">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            indeterminate={
                                table.getIsSomePageRowsSelected() &&
                                !table.getIsAllPageRowsSelected()
                            }
                            onCheckedChange={(checked) =>
                                table.toggleAllPageRowsSelected(checked)
                            }
                        />
                        Select page
                    </label>
                ) : (
                    <span className="text-muted-foreground">
                        {pluralize(rowCount, "expense")}
                    </span>
                )}
                <span className="font-semibold">
                    {totalLabel}: Rs. {total.toLocaleString()}
                </span>
            </div>

            {rows.length === 0 ? (
                <p className="rounded-md border py-10 text-center text-sm text-muted-foreground">
                    No results.
                </p>
            ) : (
                <ul className="space-y-2">
                    {rows.map((row) => {
                        const expense = row.original
                        const meta = [
                            expense.transaction_type,
                            format(new Date(expense.expense_date), "MMM d"),
                        ]
                        return (
                            <li
                                key={row.id}
                                className={cn(
                                    "flex items-start gap-3 rounded-lg border bg-background p-3",
                                    row.getIsSelected() && "bg-muted",
                                    isChanged(expense) &&
                                        "bg-amber-50 dark:bg-amber-950/30"
                                )}
                            >
                                {selectable && (
                                    <Checkbox
                                        className="mt-1"
                                        checked={row.getIsSelected()}
                                        onCheckedChange={(checked) =>
                                            row.toggleSelected(checked)
                                        }
                                        aria-label={`Select ${expense.title}`}
                                    />
                                )}

                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p className="truncate font-medium">
                                            {expense.title}
                                        </p>
                                        <p className="shrink-0 font-semibold">
                                            Rs.{" "}
                                            {Number(
                                                expense.amount
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    {editing ? (
                                        <>
                                            {renderCategoryEditor(expense)}
                                            <p className="text-xs text-muted-foreground">
                                                {meta.join(" · ")}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="truncate text-xs text-muted-foreground">
                                            {[
                                                expense.category?.name ??
                                                    "Uncategorized",
                                                ...meta,
                                            ].join(" · ")}
                                        </p>
                                    )}
                                </div>

                                {!editing && (
                                    <ExpenseRowMenu expense={expense} />
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
