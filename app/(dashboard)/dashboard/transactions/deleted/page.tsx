// "Recently deleted" expenses (server component). Only the current user's
// own deleted expenses; restore / delete-forever happen in the list.
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getDeletedExpenses } from "@/actions/expense/archive"
import { DeletedExpensesList } from "@/features/trash/components/deleted-expenses-list"

export default async function DeletedExpensesPage() {
    const expenses = await getDeletedExpenses()

    return (
        <div className="space-y-4 p-2">
            <Link
                href="/dashboard/transactions"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Expenses
            </Link>
            <div>
                <h1 className="text-2xl font-bold">Recently deleted</h1>
                <p className="text-sm text-muted-foreground">
                    Restore an expense to bring it back into your totals, or
                    delete it forever.
                </p>
            </div>
            <DeletedExpensesList expenses={expenses} />
        </div>
    )
}
