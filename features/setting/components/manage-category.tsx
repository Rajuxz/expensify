import { createCategory, getCategories } from "@/actions/category"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { toast } from "sonner"
import useSWR, { mutate } from "swr"
import { CategoryItem } from "./category-item"
import { CategoryDialog } from "./category-form"
import { useState } from "react"
import { Button } from "@/components/ui/button"
const VISIBLE_COUNT = 5
const ManageCategory = () => {
    const { data: categories } = useSWR("categories", getCategories)

    const [showAll, setShowAll] = useState(false)
    const visibleCategories = showAll
        ? categories
        : categories?.slice(0, VISIBLE_COUNT)
    const hasMore = (categories?.length ?? 0) > VISIBLE_COUNT

    async function handleCreate(values: { name: string }) {
        const result = await createCategory(values.name)
        if (result.success) {
            toast.success("Category created.")
            mutate("categories")
        } else {
            toast.error("Something went wrong.")
            throw new Error("Failed to create category")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                    Manage the categories used across your expenses.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {visibleCategories?.map((category) => {
                    return (
                        <CategoryItem key={category.id} category={category} />
                    )
                })}
                {hasMore && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowAll((prev) => !prev)}
                    >
                        {showAll
                            ? "Show less"
                            : `Load more (${categories!.length - VISIBLE_COUNT})`}
                    </Button>
                )}

                <CategoryDialog mode="add" onSubmit={handleCreate} />
            </CardContent>
        </Card>
    )
}

export default ManageCategory
