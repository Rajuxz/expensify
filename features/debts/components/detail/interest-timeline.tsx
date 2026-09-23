// Month-by-month history: each interest posting and each payment, with the
// balance after it. Makes the automatic monthly interest visible/auditable.
import { format } from "date-fns"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { TimelineEntry } from "@/lib/debts/calculate"
import { formatRs } from "@/lib/debts/money"

export function InterestTimeline({ timeline }: { timeline: TimelineEntry[] }) {
    if (timeline.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Nothing yet — the first interest is added one month after the
                start date.
            </p>
        )
    }

    // newest first
    const rows = [...timeline].reverse()

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">
                            Principal after
                        </TableHead>
                        <TableHead className="text-right">
                            Unpaid interest after
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((e, i) => (
                        <TableRow key={i}>
                            <TableCell className="whitespace-nowrap">
                                {format(new Date(e.date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                                {e.kind === "interest" ? (
                                    <span className="text-amber-700 dark:text-amber-400">
                                        Interest added
                                    </span>
                                ) : (
                                    <span className="text-emerald-700 dark:text-emerald-400">
                                        Payment
                                        <span className="block text-xs text-muted-foreground">
                                            {formatRs(e.toInterest)} interest ·{" "}
                                            {formatRs(e.toPrincipal)} principal
                                        </span>
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {e.kind === "interest" ? "+" : "−"}
                                {formatRs(e.amount)}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatRs(e.principalAfter)}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatRs(e.interestDueAfter)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
