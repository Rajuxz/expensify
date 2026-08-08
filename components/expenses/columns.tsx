"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Expense } from "@/types/expenseTableTypes"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import AppDialog from "../shared/app-dialog"
import ExpenseForm from "./expense-form"
import { DeleteExpenseButton } from "./delete-expense-button"

export const columns: ColumnDef<Expense>[] = [
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "title",
        header: "Title",
    },

    {
        accessorKey: "category.name",
        header: "Category",
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
