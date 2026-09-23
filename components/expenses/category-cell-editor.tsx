"use client"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

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
    const selected = categories.find((c) => c.id === value) ?? UNCATEGORIZED
    const isDisabled = disabled || loading

    return (
        <Combobox
            items={categories}
            value={selected}
            // clearing the input means "no category"
            onValueChange={(c: Category | null) => onChange(c?.id ?? null)}
            itemToStringLabel={(c: Category) => c.name}
            isItemEqualToValue={(a: Category, b: Category) => a.id === b.id}
            disabled={isDisabled}
        >
            <ComboboxInput
                placeholder={loading ? "Loading..." : "Category"}
                className="h-8 w-44"
                disabled={isDisabled}
            />
            <ComboboxContent>
                <ComboboxEmpty>No categories found.</ComboboxEmpty>
                <ComboboxList>
                    {(item: Category) => (
                        <ComboboxItem key={item.id ?? "none"} value={item}>
                            {item.name}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}
