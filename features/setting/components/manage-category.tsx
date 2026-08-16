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

const ManageCategory = () => {
    const { data: categories } = useSWR("categories", getCategories)

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
                {categories?.map((category) => {
                    return (
                        <CategoryItem key={category.id} category={category} />
                    )
                })}
                <CategoryDialog mode="add" onSubmit={handleCreate} />
            </CardContent>
        </Card>
    )
}

export default ManageCategory
