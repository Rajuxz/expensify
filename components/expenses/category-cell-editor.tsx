"use client"
import { useState } from "react"
import { Plus } from "lucide-react"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { useCreateCategory } from "@/hooks/use-create-category"

export type Category = { id: string | null; name: string }

const UNCATEGORIZED: Category = { id: null, name: "Uncategorized" }

type CategoryCellEditorProps = {
    categories: Category[]
    value: string | null
    onChange: (categoryId: string | null) => void
    loading?: boolean
    disabled?: boolean
}

export function CategoryCellEditor({
    categories,
    value,
    onChange,
    loading = false,
    disabled = false,
}: CategoryCellEditorProps) {
    const { createOrSelect, creating, findByName } = useCreateCategory()
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")

    const selected = categories.find((c) => c.id === value) ?? UNCATEGORIZED
    const isDisabled = disabled || loading || creating

    const q = query.trim()
    // offer "Create" when the typed text isn't an existing name (or the
    // current selection's label, which is what the input shows when closed)
    const canCreate =
        q.length > 0 &&
        q.toLowerCase() !== selected.name.toLowerCase() &&
        !findByName(q, categories)
    const hasMatches = categories.some((c) =>
        c.name.toLowerCase().includes(q.toLowerCase())
    )

    async function create() {
        const id = await createOrSelect(q)
        if (!id) return
        onChange(id)
        setOpen(false)
    }

    return (
        <Combobox
            items={categories}
            value={selected}
            open={open}
            onOpenChange={setOpen}
            onInputValueChange={setQuery}
            // clearing the input means "no category"
            onValueChange={(c: Category | null) => onChange(c?.id ?? null)}
            itemToStringLabel={(c: Category) => c.name}
            isItemEqualToValue={(a: Category, b: Category) => a.id === b.id}
            disabled={isDisabled}
        >
            <ComboboxInput
                placeholder={
                    loading
                        ? "Loading..."
                        : creating
                          ? "Creating..."
                          : "Category"
                }
                className="h-8 w-44"
                disabled={isDisabled}
                onKeyDown={(e) => {
                    // Enter with nothing to highlight -> create what was typed
                    if (e.key === "Enter" && canCreate && !hasMatches) {
                        e.preventDefault()
                        create()
                    }
                }}
            />
            <ComboboxContent>
                {!canCreate && (
                    <ComboboxEmpty>No categories found.</ComboboxEmpty>
                )}
                <ComboboxList>
                    {(item: Category) => (
                        <ComboboxItem key={item.id ?? "none"} value={item}>
                            {item.name}
                        </ComboboxItem>
                    )}
                </ComboboxList>
                {canCreate && (
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 border-t px-2 py-2 text-left text-xs hover:bg-accent disabled:opacity-50"
                        // keep focus in the input so the popup doesn't close first
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={create}
                        disabled={creating}
                    >
                        <Plus className="h-3 w-3" />
                        Create &quot;{q}&quot;
                    </button>
                )}
            </ComboboxContent>
        </Combobox>
    )
}
