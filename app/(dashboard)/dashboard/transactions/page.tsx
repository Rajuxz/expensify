import Link from "next/link"
import { Trash2 } from "lucide-react"
import { DataTable } from "@/components/shared/data-table"
import { columns } from "@/components/expenses/columns"
import { getExpenses } from "@/actions/expense"

const Transaction = async () => {
    const expenses = await getExpenses()
    return (
        <div className="p-2">
            <div className="mb-2 flex items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Expenses</h1>
                <Link
                    href="/dashboard/transactions/deleted"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <Trash2 className="h-4 w-4" />
                    Recently deleted
                </Link>
            </div>

            <DataTable columns={columns} data={expenses} />
        </div>
    )
}

export default Transaction
