import { getCategories } from "@/actions/category"
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
import { useEffect, useState } from "react"
import useSWR from "swr"

const ManageCategory = () => {
    const [newCategory, setNewCategory] = useState("")

    const { data: categories, isLoading } = useSWR("categories", getCategories)

    // const handleDeleteCategory = (id: string) => {
    //     // TODO: call deleteCategory Server Action
    //     setCategories((prev) => prev.filter((c) => c.id !== id))
    // }

    // const handleAddCategory = () => {
    //     if (!newCategory.trim()) return
    //     // TODO: call createCategory Server Action
    //     setCategories((prev) => [
    //         ...prev,
    //         { id: crypto.randomUUID(), name: newCategory.trim() },
    //     ])
    //     setNewCategory("")
    // }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                    Manage the categories used across your expenses.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    {categories?.map((cat) => (
                        <div
                            key={cat.id}
                            className="flex items-center justify-between text-sm"
                        >
                            <span>{cat.name}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => console.log("This")}
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="New category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button>Add</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default ManageCategory
