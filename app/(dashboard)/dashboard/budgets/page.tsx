"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field } from "@/components/ui/field"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { Progress } from "@/components/ui/progress"
import {
    Pencil,
    Trash2,
    Plus,
    UtensilsCrossed,
    Car,
    Home,
    MoreHorizontal,
} from "lucide-react"

import AppDialog from "@/components/shared/app-dialog"
import { cn } from "@/lib/utils"

const categories = ["Food", "Transport", "Rent", "Other"]

const categoryIcon: Record<string, React.ElementType> = {
    Food: UtensilsCrossed,
    Transport: Car,
    Rent: Home,
    Other: MoreHorizontal,
}

type CategoryBudget = {
    id: string
    category: string
    limit: number
    spent: number
}

export default function BudgetPage() {
    // Placeholder — replace with real fetch (Server Action/SWR) keyed on month
    const [overallLimit, setOverallLimit] = useState(50000)
    const overallSpent = 34200

    const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([
        { id: "1", category: "Food", limit: 15000, spent: 12500 },
        { id: "2", category: "Transport", limit: 8000, spent: 8600 },
        { id: "3", category: "Rent", limit: 20000, spent: 20000 },
        { id: "4", category: "Other", limit: 7000, spent: 2100 },
    ])

    const [newCategory, setNewCategory] = useState("")
    const [newLimit, setNewLimit] = useState("")
    const [showAddRow, setShowAddRow] = useState(false)

    const handleAddCategoryBudget = () => {
        if (!newCategory || !newLimit) return
        // TODO: call createCategoryBudget Server Action
        setCategoryBudgets((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                category: newCategory,
                limit: Number(newLimit),
                spent: 0,
            },
        ])
        setNewCategory("")
        setNewLimit("")
        setShowAddRow(false)
    }

    const handleDeleteCategoryBudget = (id: string) => {
        // TODO: call deleteCategoryBudget Server Action
        setCategoryBudgets((prev) => prev.filter((b) => b.id !== id))
    }

    const overallPct = Math.min((overallSpent / overallLimit) * 100, 100)

    return (
        <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Budget</h2>
            </div>

            {/* Overall budget — slim header bar, not a full card */}
            <div className="rounded-lg border px-4 py-3 space-y-1.5">
                <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                        This month
                    </span>
                    <span className="text-sm font-medium">
                        Rs. {overallSpent.toLocaleString()}
                        <span className="text-muted-foreground">
                            {" "}
                            / {overallLimit.toLocaleString()}
                        </span>
                    </span>
                </div>
                <Progress
                    value={overallPct}
                    className={cn(
                        "h-1.5",
                        overallPct >= 100 && "[&>div]:bg-red-500"
                    )}
                />
            </div>

            {/* Category rows */}
            <Card className="py-0 overflow-hidden">
                <CardContent className="p-0 divide-y">
                    {categoryBudgets.map((budget) => {
                        const pct = Math.min(
                            (budget.spent / budget.limit) * 100,
                            100
                        )
                        const overBudget = budget.spent > budget.limit
                        const Icon =
                            categoryIcon[budget.category] ?? MoreHorizontal

                        return (
                            <div
                                key={budget.id}
                                className="group flex items-center gap-3 px-4 py-2.5"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                    <Icon className="h-4 w-4" />
                                </div>

                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-medium truncate">
                                            {budget.category}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-xs shrink-0",
                                                overBudget
                                                    ? "text-red-500 font-medium"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            Rs. {budget.spent.toLocaleString()}{" "}
                                            / {budget.limit.toLocaleString()}
                                        </span>
                                    </div>
                                    <Progress
                                        value={pct}
                                        className={cn(
                                            "h-1",
                                            overBudget && "[&>div]:bg-red-500"
                                        )}
                                    />
                                </div>

                                <div className="flex shrink-0 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <AppDialog
                                        trigger={
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                        }
                                        title="Edit Category Budget"
                                        description="Update the limit for this category."
                                    >
                                        {/* TODO: edit form, reuse add-row fields prefilled */}
                                        <p className="text-sm text-muted-foreground">
                                            Edit form placeholder
                                        </p>
                                    </AppDialog>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() =>
                                            handleDeleteCategoryBudget(
                                                budget.id
                                            )
                                        }
                                    >
                                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}

                    {showAddRow && (
                        <div className="flex items-end gap-2 px-4 py-3 bg-muted/40">
                            <Field className="flex-1">
                                <Label className="text-xs">Category</Label>
                                <Combobox
                                    items={categories}
                                    value={newCategory}
                                    onValueChange={(value) =>
                                        console.log("this")
                                    }
                                >
                                    <ComboboxInput placeholder="Select" />
                                    <ComboboxContent>
                                        <ComboboxEmpty>
                                            No items found.
                                        </ComboboxEmpty>
                                        <ComboboxList>
                                            {(item) => (
                                                <ComboboxItem
                                                    key={item}
                                                    value={item}
                                                >
                                                    {item}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </Field>
                            <Field className="w-28">
                                <Label className="text-xs">Limit</Label>
                                <Input
                                    type="number"
                                    placeholder="10000"
                                    value={newLimit}
                                    onChange={(e) =>
                                        setNewLimit(e.target.value)
                                    }
                                />
                            </Field>
                            <Button size="sm" onClick={handleAddCategoryBudget}>
                                Add
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
