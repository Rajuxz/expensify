"use client"
// Record a payment (or a repayment received, for money lent).
// Quick-fill chips put common amounts in with one tap.
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, startOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import FieldError from "@/components/shared/field-error"
import { selectableProps } from "@/lib/selectable-props"
import { debtPaymentSchema, type DebtPaymentFormData } from "@/schemas/debt"
import { addDebtPayment } from "@/actions/debts/mutations"
import { formatRs } from "@/lib/debts/money"

type PaymentFormProps = {
    debtId: string
    startDate: Date
    interestDue: number
    payoffToday: number
    nextMonthInterest: number
}

export function PaymentForm({
    debtId,
    startDate,
    interestDue,
    payoffToday,
    nextMonthInterest,
}: PaymentFormProps) {
    const form = useForm({
        resolver: zodResolver(debtPaymentSchema),
        defaultValues: {
            amount: "" as unknown as number,
            paidOn: new Date(),
            note: "",
        },
    })

    // one-tap amounts; only the ones that make sense right now
    const quickAmounts = [
        { label: "Unpaid interest", value: interestDue },
        { label: "Monthly interest", value: nextMonthInterest },
        { label: "Settle in full", value: payoffToday },
    ].filter((q) => q.value > 0)

    const onSubmit = async (values: DebtPaymentFormData) => {
        const result = await addDebtPayment(debtId, values)
        if (!result.success) {
            toast.error(result.error)
            return
        }
        toast.success("Payment recorded.")
        form.reset({
            amount: "" as unknown as number,
            paidOn: new Date(),
            note: "",
        })
    }

    return (
        <form
            className="space-y-3"
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit(onSubmit)(e)
            }}
        >
            <div className="flex flex-wrap gap-2">
                {quickAmounts.map((q) => (
                    <Badge
                        key={q.label}
                        variant="outline"
                        className="cursor-pointer px-3 py-1"
                        {...selectableProps(() =>
                            form.setValue("amount", q.value, {
                                shouldValidate: true,
                            })
                        )}
                    >
                        {q.label}: {formatRs(q.value)}
                    </Badge>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="payment-amount">Amount (Rs.)</Label>
                    <Input
                        id="payment-amount"
                        inputMode="decimal"
                        placeholder="0.00"
                        {...form.register("amount")}
                    />
                    <FieldError
                        message={form.formState.errors.amount?.message}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>Paid on</Label>
                    <Controller
                        name="paidOn"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <>
                                <Popover>
                                    <PopoverTrigger
                                        render={
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-start font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {format(field.value, "PPP")}
                                            </Button>
                                        }
                                    />
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(d) =>
                                                d && field.onChange(d)
                                            }
                                            // not before the debt started, not in the future
                                            disabled={{
                                                before: startOfDay(startDate),
                                                after: new Date(),
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FieldError
                                    message={fieldState.error?.message}
                                />
                            </>
                        )}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="payment-note">Note (optional)</Label>
                <Input
                    id="payment-note"
                    placeholder="e.g. Paid via eSewa"
                    {...form.register("note")}
                />
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Record payment"}
            </Button>
        </form>
    )
}
