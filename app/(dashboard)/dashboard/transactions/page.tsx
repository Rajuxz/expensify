import { DataTable } from "@/components/shared/data-table"
import { columns } from "@/components/expenses/columns"
import { getExpenses } from "@/actions/expense"

const Transaction = async () => {
    const expenses = await getExpenses()
    return (
        <div className="p-2">
            <h1 className="mb-2 text-2xl font-bold">Expenses</h1>

            <DataTable columns={columns} data={expenses} />
        </div>
    )
}

export default Transaction
