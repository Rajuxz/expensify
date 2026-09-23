"use client"
import { useState } from "react"
import { toast } from "sonner"
import { bulkUpdateExpenseCategory } from "@/actions/expense"
import { Expense } from "@/types/expenseTableTypes"
import pluralize from "@/lib/helpers/pluralize"

export function useBulkCategoryEdit(data: Expense[]) {
    const [isEditing, setIsEditing] = useState(false)
    // expenseId -> new categoryId. Keyed by expense id (not row index) so
    // picks survive pagination and filtering.
    const [pendingChanges, setPendingChanges] = useState<
        Record<string, string | null>
    >({})
    const [saving, setSaving] = useState(false)

    function pickCategory(expense: Expense, categoryId: string | null) {
        setPendingChanges((prev) => {
            const next = { ...prev }
            // picking the original category again isn't a change
            if ((expense.category?.id ?? null) === categoryId)
                delete next[expense.id]
            else next[expense.id] = categoryId
            return next
        })
    }

    function getCategoryId(expense: Expense) {
        return expense.id in pendingChanges
            ? pendingChanges[expense.id]
            : (expense.category?.id ?? null)
    }

    function cancel() {
        setIsEditing(false)
        setPendingChanges({})
    }

    async function save() {
        // drop picks for expenses that vanished (e.g. deleted elsewhere)
        const existing = new Set(data.map((e) => e.id))
        const updates = Object.entries(pendingChanges)
            .filter(([id]) => existing.has(id))
            .map(([id, categoryId]) => ({ id, categoryId }))

        if (updates.length === 0) {
            cancel()
            return
        }

        setSaving(true)
        try {
            const result = await bulkUpdateExpenseCategory(updates)
            if (!result.success) {
                // keep picks so the user can retry
                toast.error(result.error ?? "Failed to update categories.")
                return
            }
            toast.success(`Updated ${pluralize(result.count ?? 0, "expense")}.`)
            cancel()
        } catch {
            toast.error("Failed to update categories.")
        } finally {
            setSaving(false)
        }
    }

    return {
        isEditing,
        start: () => setIsEditing(true),
        cancel,
        save,
        saving,
        pickCategory,
        getCategoryId,
        isChanged: (expense: Expense) => expense.id in pendingChanges,
        changeCount: Object.keys(pendingChanges).length,
    }
}
