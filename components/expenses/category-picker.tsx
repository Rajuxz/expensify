"use client"
import { useState } from "react"
import Link from "next/link"
import { Check, Plus, Settings2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { selectableProps } from "@/lib/selectable-props"
import {
    MAX_CATEGORY_NAME,
    useCreateCategory,
} from "@/hooks/use-create-category"

// One-click starters for users with no categories yet.
const STARTER_CATEGORIES = [
    "Food",
    "Transport",
    "Rent",
    "Bills",
    "Shopping",
    "Health",
]

type CategoryPickerProps = {
    value: string | null | undefined
    onChange: (categoryId: string | null) => void
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
    const { categories, isLoading, createOrSelect, creating } =
        useCreateCategory()
    const [adding, setAdding] = useState(false)
    const [draft, setDraft] = useState("")

    const selectable = categories.filter((c) => c.id !== null)
    const isEmpty = selectable.length === 0

    async function create(name: string) {
        const id = await createOrSelect(name)
        if (!id) return
        onChange(id)
        setDraft("")
        setAdding(false)
    }

    const newChip = adding ? (
        <div className="flex items-center gap-1">
            <Input
                autoFocus
                value={draft}
                maxLength={MAX_CATEGORY_NAME}
                placeholder="Category name"
                aria-label="New category name"
                className="h-7 w-36 text-xs"
                disabled={creating}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    // Enter must not submit the expense form
                    if (e.key === "Enter") {
                        e.preventDefault()
                        create(draft)
                    }
                    if (e.key === "Escape") {
                        e.preventDefault()
                        e.stopPropagation() // keep the dialog open
                        setDraft("")
                        setAdding(false)
                    }
                }}
                onBlur={() => !draft.trim() && setAdding(false)}
            />
            <Button
                type="button"
                size="icon-sm"
                variant="outline"
                disabled={creating || !draft.trim()}
                onClick={() => create(draft)}
            >
                <Check />
                <span className="sr-only">Create category</span>
            </Button>
        </div>
    ) : (
        <Badge
            variant="outline"
            className="cursor-pointer border-dashed px-3 py-1 text-muted-foreground hover:text-foreground"
            {...selectableProps(() => setAdding(true))}
        >
            <Plus className="h-3 w-3" />
            New
        </Badge>
    )

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label>
                    Category{" "}
                    <span className="font-normal text-muted-foreground">
                        (optional)
                    </span>
                </Label>
                {!isEmpty && (
                    <Link
                        href="/dashboard/settings#categories"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <Settings2 className="h-3 w-3" />
                        Manage
                    </Link>
                )}
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">
                    Loading categories...
                </p>
            ) : isEmpty ? (
                <div className="space-y-2 rounded-md border border-dashed p-3">
                    <p className="text-xs text-muted-foreground">
                        No categories yet. Tap a starter or create your own —
                        you can also skip this and categorize later.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {STARTER_CATEGORIES.map((name) => (
                            <Badge
                                key={name}
                                variant="secondary"
                                className="cursor-pointer px-3 py-1"
                                aria-disabled={creating}
                                {...selectableProps(
                                    () => !creating && create(name)
                                )}
                            >
                                <Plus className="h-3 w-3" />
                                {name}
                            </Badge>
                        ))}
                        {newChip}
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {selectable.map((cat) => (
                        <Badge
                            key={cat.id}
                            variant={value === cat.id ? "default" : "outline"}
                            className="cursor-pointer px-3 py-1"
                            aria-pressed={value === cat.id}
                            {...selectableProps(() =>
                                // clicking the selected one again clears it
                                onChange(value === cat.id ? null : cat.id)
                            )}
                        >
                            {cat.name}
                        </Badge>
                    ))}
                    {newChip}
                </div>
            )}
        </div>
    )
}
