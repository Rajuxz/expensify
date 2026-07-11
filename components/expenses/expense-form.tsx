"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import { ExpenseFormData, expenseSchema } from "@/schemas/expense"

const CATEGORIES = [
    { id: "550e8400-e29b-41d4-a716-446655440000", name: "Food" },
    { id: "550e8400-e29b-41d4-a716-446655440001", name: "Transport" },
] as const
const TRANSACTION_TYPES = ["CASH", "ONLINE"] as const

type ExpenseFormProps = {
    onSubmit?: (data: {
        title: string
        amount: string
        date: Date | undefined
        transactionType: string
        category: string
        description: string
    }) => void
}

const ExpenseForm = ({ onSubmit }: ExpenseFormProps) => {
    const form = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            title: "",
            amount: 1,
            description: "",
            expense_date: new Date(),
            transaction_type: "CASH",
            categoryId: "",
        },
    })
    return (
        <Card className="w-full sm:max-w-md px-2">
            <form className="space-y-4">
                {/* Title & Amount */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Controller
                            name="title"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Groceries"
                                        {...field}
                                    />
                                    {fieldState.error && (
                                        <p className="text-sm text-destructive">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </>
                            )}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="amount">Amount</Label>
                        <Controller
                            name="amount"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Input
                                        id="amount"
                                        placeholder="0.00"
                                        {...field}
                                    />
                                    {fieldState.error && (
                                        <p className="text-sm text-destructive">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </>
                            )}
                        />
                    </div>
                </div>

                {/* Date & Transaction Type */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Expense Date</Label>
                        <Controller
                            name="expense_date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Popover>
                                        <PopoverTrigger
                                            render={
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !field.value &&
                                                            "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value
                                                        ? format(
                                                              field.value,
                                                              "PPP"
                                                          )
                                                        : "Pick a date"}
                                                </Button>
                                            }
                                        />
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {fieldState.error && (
                                        <p className="text-sm text-destructive">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </>
                            )}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Transaction Type</Label>
                        <Controller
                            name="transaction_type"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <>
                                    <div className="flex gap-2">
                                        {TRANSACTION_TYPES.map((type) => (
                                            <Button
                                                key={type}
                                                type="button"
                                                variant={
                                                    field.value === type
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className="flex-1"
                                                onClick={() =>
                                                    field.onChange(type)
                                                }
                                            >
                                                {type}
                                            </Button>
                                        ))}
                                    </div>
                                    {fieldState.error && (
                                        <p className="text-sm text-destructive">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </>
                            )}
                        />
                    </div>
                </div>
                {/* Category */}
                <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Controller
                        name="categoryId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <>
                                <div className="flex gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <Badge
                                            key={cat.id}
                                            variant={
                                                field.value === cat.id
                                                    ? "default"
                                                    : "outline"
                                            }
                                            className="cursor-pointer px-3 py-1"
                                            onClick={() =>
                                                field.onChange(cat.id)
                                            }
                                        >
                                            {cat.name}
                                        </Badge>
                                    ))}
                                </div>
                                {fieldState.error && (
                                    <p className="text-sm text-destructive">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </>
                        )}
                    />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Controller
                        name="description"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <>
                                <Textarea
                                    className="resize-none"
                                    id="description"
                                    placeholder="Add any notes..."
                                    {...field}
                                />
                                {fieldState.error && (
                                    <p className="text-sm text-destructive">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Saving..." : "Save Expense"}
                </Button>
            </form>
        </Card>
    )
}

export default ExpenseForm
