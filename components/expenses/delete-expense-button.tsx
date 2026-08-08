"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { softDeleteExpense } from "@/actions/expense"
import { toast } from "sonner"

export function DeleteExpenseButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await softDeleteExpense(id)
                toast.success("Expense deleted")
            } catch (error) {
                toast.error("Failed to delete expense")
            }
        })
    }

    return (
        <Button
            variant="outline"
            className="w-fit shrink-0 bg-red-500 text-white hover:text-white hover:bg-red-600 transition-all duration-200"
            onClick={handleDelete}
            disabled={isPending}
        >
            {isPending ? "Deleting..." : "Confirm"}
        </Button>
    )
}
