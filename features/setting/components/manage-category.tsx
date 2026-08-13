import { createCategory, getCategories } from "@/actions/category"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast, useSonner } from "sonner"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { CategoryList } from "./visible-categories"

const ManageCategory = () => {
    const [newCategory, setNewCategory] = useState("")
    const { data: categories, isLoading } = useSWR("categories", getCategories)
    const [pending, startTransition] = useTransition()
    const router = useRouter()

    function handleCreate() {
        if (!newCategory.trim()) return

        startTransition(async () => {
            const result = await createCategory(newCategory)
            if (result.success) {
                setNewCategory("")
                toast.success("Category created. ")
                router.refresh()
            } else {
                toast.error("Something went wrong.")
            }
        })
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
                <CategoryList categories={categories} />
                <div className="flex gap-2">
                    <Input
                        placeholder="New category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button onClick={handleCreate} disabled={pending}>
                        Add
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default ManageCategory
