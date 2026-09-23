"use client"
// Permanently delete a debt (and its payments), behind a confirmation.
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import AppDialog from "@/components/shared/app-dialog"
import { deleteDebt } from "@/actions/debts/mutations"

type DeleteDebtButtonProps = {
    debtId: string
    counterparty: string
    paymentCount: number
}

export function DeleteDebtButton({
    debtId,
    counterparty,
    paymentCount,
}: DeleteDebtButtonProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleDelete() {
        startTransition(async () => {
            const result = await deleteDebt(debtId)
            if (!result.success) {
                toast.error(result.error)
                return
            }
            toast.success("Debt deleted.")
            router.push("/dashboard/debts")
        })
    }

    return (
        <AppDialog
            open={open}
            onOpenChange={(next) => !isPending && setOpen(next)}
            trigger={
                <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                </Button>
            }
            title={`Delete debt with ${counterparty}?`}
            description={`This permanently removes the debt${
                paymentCount
                    ? ` and its ${paymentCount} recorded payment(s)`
                    : ""
            }. It can't be undone. If it's paid off, you don't need to delete it — it moves to "Settled" automatically.`}
        >
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
                    {isPending ? "Deleting..." : "Delete permanently"}
                </Button>
            </div>
        </AppDialog>
    )
}
