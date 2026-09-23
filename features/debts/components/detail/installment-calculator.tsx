"use client"
// "How much per month to clear this in N months?" for the current balance.
import { useState } from "react"
import { addMonths, format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { monthlyInstallment, totalInterestFor } from "@/lib/debts/calculate"
import { formatRs } from "@/lib/debts/money"

type InstallmentCalculatorProps = {
    principal: number // principal remaining
    unpaidInterest: number // posted, not yet paid
    monthlyRate: number
    firstPaymentDate: Date | null // next interest date
}

export function InstallmentCalculator({
    principal,
    unpaidInterest,
    monthlyRate,
    firstPaymentDate,
}: InstallmentCalculatorProps) {
    const [months, setMonths] = useState("6")
    const n = Math.floor(Number(months))
    const valid = Number.isFinite(n) && n >= 1 && n <= 360

    const perMonth = valid
        ? monthlyInstallment(principal, monthlyRate, n, unpaidInterest)
        : 0
    const interest = valid
        ? totalInterestFor(principal, monthlyRate, n, unpaidInterest)
        : 0

    if (principal + unpaidInterest <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Nothing left to pay.
            </p>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-end gap-2">
                <div className="space-y-1.5">
                    <Label htmlFor="months">Clear it in (months)</Label>
                    <Input
                        id="months"
                        type="number"
                        min={1}
                        max={360}
                        inputMode="numeric"
                        className="w-28"
                        value={months}
                        onChange={(e) => setMonths(e.target.value)}
                    />
                </div>
                <div className="flex gap-1 pb-0.5">
                    {[3, 6, 12].map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMonths(String(m))}
                            className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {valid ? (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <p>
                        Pay{" "}
                        <span className="text-base font-semibold">
                            {formatRs(perMonth)}
                        </span>{" "}
                        per month
                        {firstPaymentDate &&
                            `, on the ${format(new Date(firstPaymentDate), "do")}`}
                        .
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Total interest {formatRs(interest)} · total paid{" "}
                        {formatRs(perMonth * n)}
                        {firstPaymentDate &&
                            ` · done by ${format(addMonths(new Date(firstPaymentDate), n - 1), "MMM yyyy")}`}
                    </p>
                </div>
            ) : (
                <p className="text-xs text-destructive">
                    Enter between 1 and 360 months.
                </p>
            )}
        </div>
    )
}
