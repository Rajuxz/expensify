"use client"
// Past payments, newest first, each removable (e.g. a typo'd amount).
import { useTransition } from "react"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { DebtView } from "@/lib/debts/serialize"
import { deleteDebtPayment } from "@/actions/debts/mutations"
import { formatRs } from "@/lib/debts/money"

type PaymentHistoryProps = {
    debtId: string
    payments: DebtView["payments"]
}

export function PaymentHistory({ debtId, payments }: PaymentHistoryProps) {
    const [isPending, startTransition] = useTransition()

    function remove(paymentId: string) {
        startTransition(async () => {
            const result = await deleteDebtPayment(debtId, paymentId)
            if (result.success) toast.success("Payment removed.")
            else toast.error(result.error)
        })
    }

    if (payments.length === 0) {
        return <p className="text-sm text-muted-foreground">No payments yet.</p>
    }

    return (
        <ul className="divide-y">
            {payments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                            {formatRs(p.amount)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {format(new Date(p.paidOn), "MMM d, yyyy")}
                            {p.note && ` · ${p.note}`}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={isPending}
                        onClick={() => remove(p.id)}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove payment</span>
                    </Button>
                </li>
            ))}
        </ul>
    )
}
