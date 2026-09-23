"use client"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import pluralize from "@/lib/helpers/pluralize"

type BulkEditControlsProps = {
    isEditing: boolean
    changeCount: number
    saving: boolean
    disabled?: boolean
    onStart: () => void
    onSave: () => void
    onCancel: () => void
}

export function BulkEditControls({
    isEditing,
    changeCount,
    saving,
    disabled = false,
    onStart,
    onSave,
    onCancel,
}: BulkEditControlsProps) {
    if (!isEditing) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={onStart}
                disabled={disabled}
            >
                <Pencil className="mr-1 h-4 w-4" />
                Bulk edit categories
            </Button>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                onClick={onSave}
                disabled={saving || changeCount === 0}
            >
                {saving
                    ? "Saving..."
                    : `Save changes${changeCount ? ` (${changeCount})` : ""}`}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={saving}
            >
                Cancel
            </Button>
            <span className="text-xs text-muted-foreground">
                {changeCount
                    ? pluralize(changeCount, "unsaved change")
                    : "Pick a category for any row"}
            </span>
        </div>
    )
}
