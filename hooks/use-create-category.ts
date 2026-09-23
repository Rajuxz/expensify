"use client"
import { useState } from "react"
import useSWR, { mutate } from "swr"
import { toast } from "sonner"
import { createCategory, getCategories } from "@/actions/category"

export const MAX_CATEGORY_NAME = 50

const normalize = (name: string) => name.trim().toLowerCase()

// Create-or-select: typing a name that already exists (any casing) returns
// the existing category instead of erroring, so inline "create" is safe.
export function useCreateCategory() {
    const { data: categories = [], isLoading } = useSWR(
        "categories",
        getCategories
    )
    const [creating, setCreating] = useState(false)

    const findByName = (name: string, list = categories) =>
        list.find((c) => c.id !== null && normalize(c.name) === normalize(name))

    async function createOrSelect(rawName: string): Promise<string | null> {
        const name = rawName.trim().replace(/\s+/g, " ")
        if (!name) return null
        if (name.length > MAX_CATEGORY_NAME) {
            toast.error(`Keep it under ${MAX_CATEGORY_NAME} characters.`)
            return null
        }
        if (normalize(name) === "uncategorized") {
            toast.error(`"Uncategorized" is reserved.`)
            return null
        }

        const existing = findByName(name)
        if (existing?.id) return existing.id

        setCreating(true)
        try {
            const result = await createCategory(name)
            if (result.success && result.data) {
                // wait for the refreshed list so pickers can show the new name
                await mutate("categories")
                toast.success(`Category "${result.data.name}" created.`)
                return result.data.id
            }
            // created elsewhere in the meantime -> refetch and select it
            const fresh = await mutate("categories", getCategories())
            const match = fresh && findByName(name, fresh)
            if (match?.id) return match.id

            toast.error(result.error ?? "Could not create category.")
            return null
        } catch {
            toast.error("Could not create category.")
            return null
        } finally {
            setCreating(false)
        }
    }

    return { categories, isLoading, createOrSelect, creating, findByName }
}
