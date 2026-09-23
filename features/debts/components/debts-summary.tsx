// Top-of-page totals across all open debts.
import { StatCard } from "@/components/dashboard/stat-card"
import type { DebtView } from "@/lib/debts/serialize"
import { formatRs } from "@/lib/debts/money"

export function DebtsSummary({ debts }: { debts: DebtView[] }) {
    const open = debts.filter((d) => !d.state.isSettled)
    const sum = (list: DebtView[], pick: (d: DebtView) => number) =>
        list.reduce((total, d) => total + pick(d), 0)

    const borrowed = open.filter((d) => d.direction === "BORROWED")
    const lent = open.filter((d) => d.direction === "LENT")

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
                label="I owe (to settle today)"
                value={formatRs(sum(borrowed, (d) => d.state.payoffToday))}
            />
            <StatCard
                label="Owed to me (to settle today)"
                value={formatRs(sum(lent, (d) => d.state.payoffToday))}
            />
            <StatCard
                label="Interest on my debts, next month"
                value={formatRs(
                    sum(borrowed, (d) => d.state.nextMonthInterest)
                )}
            />
        </div>
    )
}
