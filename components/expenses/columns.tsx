"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Expense } from "@/types/expenseTableTypes"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Trash2 } from "lucide-react"
import AppDialog from "../shared/app-dialog"
import ExpenseForm from "./expense-form"
import { DeleteExpenseButton } from "./delete-expense-button"

export const columns: ColumnDef<Expense>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                indeterminate={
                    table.getIsSomePageRowsSelected() &&
                    !table.getIsAllPageRowsSelected()
                }
                onCheckedChange={(checked) =>
                    table.toggleAllPageRowsSelected(checked)
                }
                aria-label="Select all on this page"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(checked) => row.toggleSelected(checked)}
                aria-label={`Select ${row.original.title}`}
            />
        ),
    },
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "title",
        header: "Title",
    },

    {
        id: "category",
        accessorFn: (row) => row.category?.name ?? "Uncategorized",
        header: "Category",
        // filter value `true` = only uncategorized (matched by id, not name)
        filterFn: (row, _columnId, onlyUncategorized) =>
            !onlyUncategorized || !row.original.category,
        cell: ({ row }) => {
            const categoryName = row.original.category?.name
            return categoryName ?? "Uncategorized"
        },
    },

    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = row.getValue("amount") as number

            return (
                <div className="font-medium">Rs. {amount.toLocaleString()}</div>
            )
        },
    },

    {
        accessorKey: "transaction_type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("transaction_type") as string

            return <span className={"text-red-500 font-bold"}>{type}</span>
        },
    },

    {
        accessorKey: "expense_date",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("expense_date"))

            return date.toLocaleDateString()
        },
    },
    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const expense = row.original
            return (
                <div className="flex items-center gap-1.5">
                    <AppDialog
                        trigger={
                            <Button
                                variant="outline"
                                className={"text-green-600 rounded-md"}
                                size="icon"
                            >
                                <Pencil className="h-4 w-4" />

                                <span className="sr-only">Edit expense</span>
                            </Button>
                        }
                        title="Update Expense"
                        description="Update the details for your new expense."
                    >
                        <ExpenseForm initialData={expense} />
                    </AppDialog>
                    <AppDialog
                        trigger={
                            <Button
                                variant="outline"
                                size="icon"
                                className={
                                    "bg-red-500 text-white rounded-md hover:bg-red-600 hover:text-white transition-all ease-in-out"
                                }
                            >
                                <Trash2 className="h-4 w-4" />

                                <span className="sr-only">Delete expense</span>
                            </Button>
                        }
                        title="Delete Expense?"
                        description="This action cannot be undone."
                    >
                        <DeleteExpenseButton id={expense.id} />
                    </AppDialog>
                </div>
            )
        },
    },
]
