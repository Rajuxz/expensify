"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useSWR, { mutate } from "swr"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import FieldError from "@/components/shared/field-error"
import { createCategory, getCategories } from "@/actions/category"
import { selectableProps } from "@/lib/selectable-props"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import { ExpenseFormData, expenseSchema } from "@/schemas/expense"
import { useState } from "react"
import { createExpense, updateExpenses } from "@/actions/expense"
import { toast } from "sonner"
import { Expense } from "@/types/expenseTableTypes"
import { CategoryDialog } from "@/features/setting/components/category-form"
type ExpenseFormProps = {
    initialData?: Expense
}

const TRANSACTION_TYPES = ["CASH", "ONLINE"] as const

const ExpenseForm = ({ initialData }: ExpenseFormProps) => {
    const { data: categories = [], isLoading: categoriesLoading } = useSWR(
        "categories",
        getCategories
    )
    const hasCategories = categories.length > 0

    const form = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            title: initialData?.title ?? "",
            amount: initialData?.amount ?? 1,
            description: initialData?.description ?? "",
            expense_date: initialData?.expense_date ?? new Date(),
            transaction_type: initialData?.transaction_type ?? "CASH",
            categoryId: initialData?.category.id ?? "",
        },
    })
    async function handleCreateCategory(values: { name: string }) {
        const result = await createCategory(values.name)
        if (result.success) {
            toast.success("Category created.")
            mutate("categories")
        } else {
            toast.error(result.error ?? "Something went wrong.")
            throw new Error("Failed to create category")
        }
    }
    const onSubmit = async (data: ExpenseFormData) => {
        try {
            if (initialData) {
                const result = await updateExpenses(initialData.id, data)

                if (!result.success) {
                    toast.error(result.error ?? "Failed to update expense")

                    return
                }

                toast.success("Expense updated successfully")
            } else {
                const result = await createExpense(data)
                if (!result.success) {
                    form.setError("root", { message: result.error })
                    toast.error(result.error ?? "Something went wrong.")
                    return
                }

                form.reset()
                toast.success("Expense added successfully.")
            }
        } catch (error) {}
    }

    return (
        <Card className="w-full sm:max-w-md px-2">
            <form
                className="space-y-4"
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit(onSubmit)
                }}
            >
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
                                    <FieldError
                                        message={fieldState.error?.message}
                                    />
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
                                    <FieldError
                                        message={fieldState.error?.message}
                                    />
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
                                    <FieldError
                                        message={fieldState.error?.message}
                                    />
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
                                    <FieldError
                                        message={fieldState.error?.message}
                                    />
                                </>
                            )}
                        />
                    </div>
                </div>
                {/* Category */}
                <div className="space-y-1.5">
                    <Label>Category</Label>
                    {categoriesLoading ? (
                        <p className="text-sm text-muted-foreground">
                            Loading categories...
                        </p>
                    ) : !hasCategories ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>No categories yet.</span>
                            <CategoryDialog
                                mode="add"
                                onSubmit={handleCreateCategory}
                            />
                        </div>
                    ) : (
                        <Controller
                            name="categoryId"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <>
                                    <div className="flex gap-2 flex-wrap">
                                        {categories.map((cat) => (
                                            <Badge
                                                key={cat.id}
                                                variant={
                                                    field.value === cat.id
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className="cursor-pointer px-3 py-1"
                                                {...selectableProps(() =>
                                                    field.onChange(cat.id)
                                                )}
                                            >
                                                {cat.name}
                                            </Badge>
                                        ))}
                                    </div>
                                    <FieldError
                                        message={fieldState.error?.message}
                                    />
                                </>
                            )}
                        />
                    )}
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
                                <FieldError
                                    message={fieldState.error?.message}
                                />
                            </>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting
                        ? initialData
                            ? "Updating..."
                            : "Saving..."
                        : initialData
                          ? "Update Expense"
                          : "Save Expense"}
                </Button>
            </form>
        </Card>
    )
}

export default ExpenseForm
