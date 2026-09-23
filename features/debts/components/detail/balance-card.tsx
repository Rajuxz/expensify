// Where the debt stands today: principal, interest, and what settles it.
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DebtState } from "@/lib/debts/calculate"
import { formatRs } from "@/lib/debts/money"

function Row({
    label,
    value,
    hint,
    strong = false,
}: {
    label: string
    value: string
    hint?: string
    strong?: boolean
}) {
    return (
        <div className="flex items-baseline justify-between gap-4 py-1.5">
            <div>
                <p className={strong ? "font-semibold" : "text-sm"}>{label}</p>
                {hint && (
                    <p className="text-xs text-muted-foreground">{hint}</p>
                )}
            </div>
            <p className={strong ? "text-lg font-semibold" : "text-sm"}>
                {value}
            </p>
        </div>
    )
}

export function BalanceCard({ state }: { state: DebtState }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Balance today</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
                <Row
                    label="Principal remaining"
                    value={formatRs(state.principalOutstanding)}
                />
                <Row
                    label="Unpaid interest"
                    hint="Added on past monthly dates, not yet paid"
                    value={formatRs(state.interestDue)}
                />
                <Row
                    label="Interest so far this month"
                    hint={
                        state.nextPostingDate
                            ? `Added on ${format(new Date(state.nextPostingDate), "MMM d")}`
                            : undefined
                    }
                    value={formatRs(state.accruedThisMonth)}
                />
                <Row
                    label={state.isSettled ? "Settled" : "To settle today"}
                    value={formatRs(state.payoffToday)}
                    strong
                />
                <div className="grid grid-cols-2 gap-4 pt-3 text-xs text-muted-foreground">
                    <p>
                        Paid so far
                        <br />
                        <span className="text-sm text-foreground">
                            {formatRs(state.totalPaid)}
                        </span>
                    </p>
                    <p>
                        Interest charged so far
                        <br />
                        <span className="text-sm text-foreground">
                            {formatRs(state.totalInterestCharged)}
                        </span>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
