// One debt in the list: who, how much is owed today, and what's next.
import Link from "next/link"
import { format } from "date-fns"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { DebtView } from "@/lib/debts/serialize"
import { formatRs } from "@/lib/debts/money"

export function DebtCard({ debt }: { debt: DebtView }) {
    const { state } = debt

    return (
        <Link
            href={`/dashboard/debts/${debt.id}`}
            className="flex items-center gap-3 rounded-xl border bg-background p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
        >
            <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{debt.counterparty}</p>
                    {state.isSettled ? (
                        <Badge variant="secondary">Settled</Badge>
                    ) : state.interestDue > 0 ? (
                        <Badge variant="destructive">Interest due</Badge>
                    ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                    {formatRs(debt.principal)} at {debt.monthlyRate}% / month ·
                    since {format(new Date(debt.startDate), "MMM d, yyyy")}
                </p>
                {!state.isSettled && state.nextPostingDate && (
                    <p className="text-xs text-muted-foreground">
                        Next interest {formatRs(state.nextMonthInterest)} on{" "}
                        {format(new Date(state.nextPostingDate), "MMM d")}
                    </p>
                )}
            </div>
            <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground">
                    {state.isSettled ? "Paid" : "To settle today"}
                </p>
                <p className="font-semibold">
                    {formatRs(
                        state.isSettled ? state.totalPaid : state.payoffToday
                    )}
                </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
    )
}
