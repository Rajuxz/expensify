"use client"

import { deleteCategory, updateCategory } from "@/actions/category"
import { Button } from "@/components/ui/button"
import { Pen, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useSWRConfig } from "swr"
import { CategoryDialog } from "./category-form"
import AppDialog from "@/components/shared/app-dialog"
import { useState } from "react"

type Category = {
    id: string
    name: string
}
export function CategoryItem({ category }: { category: Category }) {
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const { mutate } = useSWRConfig()

    async function handleUpdate(values: { name: string }) {
        if (values.name.trim() === category.name) return

        const result = await updateCategory(values.name, category.id)
        if (result.success) {
            toast.success("Category updated successfully.")
            mutate("categories")
        } else {
            toast.error(
                result.error ?? "Something went wrong. Please try again."
            )
            throw new Error("Failed to update category") // keeps dialog open
        }
    }

    async function handleDelete() {
        setIsDeleting(true)
        const result = await deleteCategory(category.id)
        setIsDeleting(false)

        if (result?.success) {
            toast.success("Category deleted successfully.")
            mutate("categories")
            setDeleteOpen(false)
        } else {
            toast.error(result?.error ?? "Something went wrong.")
            setDeleteOpen(false)
        }
    }

    return (
        <div className="flex items-center justify-between text-sm">
            <span>{category.name}</span>
            <div className="flex">
                <CategoryDialog
                    mode="edit"
                    category={category}
                    onSubmit={handleUpdate}
                />
                <AppDialog
                    open={deleteOpen}
                    onOpenChange={setDeleteOpen}
                    trigger={
                        <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500 cursor-pointer" />
                        </Button>
                    }
                    title="Delete Category"
                    description="This action cannot be undone."
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className={
                            "bg-black text-white w-fit px-4 hover:bg-black hover:text-white"
                        }
                        onClick={handleDelete}
                    >
                        {isDeleting ? "Deleting..." : "Yes! Confirm."}
                    </Button>
                </AppDialog>
            </div>
        </div>
    )
}
