"use client"
// Create or edit a debt. Same zod schema as the server action.
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import AppDialog from "@/components/shared/app-dialog"
import FieldError from "@/components/shared/field-error"
import { debtSchema, type DebtFormData } from "@/schemas/debt"
import { createDebt, updateDebt } from "@/actions/debts/mutations"
import { DIRECTION, type Direction } from "../constants"

type DebtFormDialogProps = {
    trigger: React.ReactElement
    // present = edit mode
    debt?: {
        id: string
        direction: Direction
        counterparty: string
        principal: number
        monthlyRate: number
        startDate: Date
        note: string | null
    }
    defaultDirection?: Direction
}

export function DebtFormDialog({
    trigger,
    debt,
    defaultDirection = "BORROWED",
}: DebtFormDialogProps) {
    const [open, setOpen] = useState(false)

    // built fresh each time, so an edit dialog reopened after saving shows
    // the saved values rather than the ones from its first render
    const formValues = () => ({
        direction: debt?.direction ?? defaultDirection,
        counterparty: debt?.counterparty ?? "",
        principal: debt?.principal ?? ("" as unknown as number),
        monthlyRate: debt?.monthlyRate ?? 0,
        startDate: debt?.startDate ? new Date(debt.startDate) : new Date(),
        note: debt?.note ?? "",
    })

    const form = useForm({
        resolver: zodResolver(debtSchema),
        defaultValues: formValues(),
    })
    const direction = form.watch("direction")

    const onSubmit = async (values: DebtFormData) => {
        const result = debt
            ? await updateDebt(debt.id, values)
            : await createDebt(values)
        if (!result.success) {
            toast.error(result.error)
            return
        }
        toast.success(debt ? "Debt updated." : "Debt added.")
        if (!debt) form.reset(formValues())
        setOpen(false)
    }

    return (
        <AppDialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next)
                // edit: start from the saved values each time it opens
                if (next && debt) form.reset(formValues())
            }}
            trigger={trigger}
            title={debt ? "Edit debt" : "Add debt"}
            description="Interest is simple: a monthly % of what's still unpaid."
        >
            <form
                className="space-y-4"
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit(onSubmit)(e)
                }}
            >
                {/* Direction */}
                <Controller
                    name="direction"
                    control={form.control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 gap-2">
                            {(["BORROWED", "LENT"] as const).map((d) => (
                                <Button
                                    key={d}
                                    type="button"
                                    variant={
                                        field.value === d
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => field.onChange(d)}
                                >
                                    {DIRECTION[d].tab}
                                </Button>
                            ))}
                        </div>
                    )}
                />

                <div className="space-y-1.5">
                    <Label htmlFor="counterparty">
                        {DIRECTION[direction].counterpartyLabel}
                    </Label>
                    <Input
                        id="counterparty"
                        placeholder={
                            DIRECTION[direction].counterpartyPlaceholder
                        }
                        {...form.register("counterparty")}
                    />
                    <FieldError
                        message={form.formState.errors.counterparty?.message}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="principal">Amount (Rs.)</Label>
                        <Input
                            id="principal"
                            inputMode="decimal"
                            placeholder="100000"
                            {...form.register("principal")}
                        />
                        <FieldError
                            message={form.formState.errors.principal?.message}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="monthlyRate">Interest % / month</Label>
                        <Input
                            id="monthlyRate"
                            inputMode="decimal"
                            placeholder="0 = interest-free"
                            {...form.register("monthlyRate")}
                        />
                        <FieldError
                            message={form.formState.errors.monthlyRate?.message}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Start date</Label>
                    <Controller
                        name="startDate"
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
                                                {field.value
                                                    ? format(field.value, "PPP")
                                                    : "Pick a date"}
                                            </Button>
                                        }
                                    />
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            defaultMonth={field.value}
                                            disabled={{ after: new Date() }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <p className="text-xs text-muted-foreground">
                                    Interest is added on this day every month.
                                </p>
                                <FieldError
                                    message={fieldState.error?.message}
                                />
                            </>
                        )}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="note">Note (optional)</Label>
                    <Textarea
                        id="note"
                        className="resize-none"
                        placeholder="Purpose, agreement details..."
                        {...form.register("note")}
                    />
                    <FieldError message={form.formState.errors.note?.message} />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting
                        ? "Saving..."
                        : debt
                          ? "Save changes"
                          : "Add debt"}
                </Button>
            </form>
        </AppDialog>
    )
}
