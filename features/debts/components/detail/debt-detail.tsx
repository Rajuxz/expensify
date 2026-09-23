"use client"
// Detail page for one debt: balance, record payment, installment plan,
// payment history and the month-by-month interest timeline.
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DebtView } from "@/lib/debts/serialize"
import { formatRs } from "@/lib/debts/money"
import { DIRECTION } from "../../constants"
import { DebtFormDialog } from "../debt-form-dialog"
import { BalanceCard } from "./balance-card"
import { PaymentForm } from "./payment-form"
import { InstallmentCalculator } from "./installment-calculator"
import { PaymentHistory } from "./payment-history"
import { InterestTimeline } from "./interest-timeline"
import { DeleteDebtButton } from "./delete-debt-button"

export function DebtDetail({ debt }: { debt: DebtView }) {
    const { state } = debt
    const labels = DIRECTION[debt.direction]

    return (
        <div className="space-y-4">
            <Link
                href="/dashboard/debts"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                All debts
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">
                            {debt.counterparty}
                        </h2>
                        <Badge variant="outline">{labels.short}</Badge>
                        {state.isSettled && (
                            <Badge variant="secondary">Settled</Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {formatRs(debt.principal)} at {debt.monthlyRate}% per
                        month, since{" "}
                        {format(new Date(debt.startDate), "MMM d, yyyy")}
                    </p>
                    {debt.note && <p className="mt-1 text-sm">{debt.note}</p>}
                </div>
                <div className="flex gap-2">
                    <DebtFormDialog
                        debt={debt}
                        trigger={
                            <Button variant="outline" size="sm">
                                <Pencil className="mr-1 h-4 w-4" />
                                Edit
                            </Button>
                        }
                    />
                    <DeleteDebtButton
                        debtId={debt.id}
                        counterparty={debt.counterparty}
                        paymentCount={debt.payments.length}
                    />
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <BalanceCard state={state} />

                <div className="space-y-4">
                    {!state.isSettled && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{labels.paymentVerb}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PaymentForm
                                    debtId={debt.id}
                                    startDate={new Date(debt.startDate)}
                                    interestDue={state.interestDue}
                                    payoffToday={state.payoffToday}
                                    nextMonthInterest={state.nextMonthInterest}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {!state.isSettled && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Installment plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <InstallmentCalculator
                                    principal={state.principalOutstanding}
                                    unpaidInterest={state.interestDue}
                                    monthlyRate={debt.monthlyRate}
                                    firstPaymentDate={state.nextPostingDate}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    <PaymentHistory debtId={debt.id} payments={debt.payments} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Interest history</CardTitle>
                </CardHeader>
                <CardContent>
                    <InterestTimeline timeline={state.timeline} />
                </CardContent>
            </Card>
        </div>
    )
}
