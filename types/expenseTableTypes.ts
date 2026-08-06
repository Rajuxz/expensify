// types/expense.ts
export type TransactionType = "CASH" | "ONLINE"
export type Expense = {
    id: string
    title: string
    amount: number
    description: string
    expense_date: Date
    transaction_type: TransactionType

    category: {
        id: string
        name: string
    }
}
