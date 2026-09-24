"use client"
// Confirmation before permanently deleting expenses. Irreversible.
import { useState } from "react"
import { Button } from "@/components/ui/button"
import AppDialog from "@/components/shared/app-dialog"
import pluralize from "@/lib/helpers/pluralize"

type PurgeConfirmDialogProps = {
    trigger: React.ReactElement
    count: number
    pending: boolean
    onConfirm: () => Promise<boolean> // true = done, close the dialog
}

export function PurgeConfirmDialog({
    trigger,
    count,
    pending,
    onConfirm,
}: PurgeConfirmDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <AppDialog
            open={open}
            onOpenChange={(next) => !pending && setOpen(next)}
            trigger={trigger}
            title={`Delete ${pluralize(count, "expense")} forever?`}
            description="They'll be removed from the database for good and can't be restored. Your totals don't change — deleted expenses already don't count."
        >
            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                >
                    Cancel
                </Button>
                <Button
                    className="bg-destructive text-white hover:bg-destructive/90"
                    disabled={pending}
                    onClick={async () => {
                        if (await onConfirm()) setOpen(false)
                    }}
                >
                    {pending ? "Deleting..." : "Delete forever"}
                </Button>
            </div>
        </AppDialog>
    )
}
