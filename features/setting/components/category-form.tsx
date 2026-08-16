// category-dialog.tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import AppDialog from "@/components/shared/app-dialog"
const categorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryDialogProps {
    mode: "add" | "edit"
    category?: { id: string; name: string }
    onSubmit: (values: CategoryFormValues) => void | Promise<void>
}

export function CategoryDialog({
    mode,
    category,
    onSubmit,
}: CategoryDialogProps) {
    const [open, setOpen] = useState(false)

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: category?.name ?? "" },
    })

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit(values)
        form.reset()
        setOpen(false)
    })

    return (
        <AppDialog
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer text-green-600 hover:text-green-700 transition-all duration-150"
                >
                    {mode === "add" ? (
                        <Plus className="h-4 w-4" />
                    ) : (
                        <Pencil className="h-4 w-4" />
                    )}
                </Button>
            }
            title={mode === "add" ? "Add category" : "Edit category"}
            description={
                mode === "add"
                    ? "Please enter the name of your category."
                    : "Update the name of your category."
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <Input placeholder="Eg. Grocery" {...form.register("name")} />
                {form.formState.errors.name && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                    </p>
                )}
                <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="bg-black w-fit mt-3 px-3 text-white cursor-pointer hover:bg-black hover:text-white focus:bg-black focus:text-white"
                    disabled={form.formState.isSubmitting}
                >
                    {mode === "add" ? "Add" : "Update"}
                </Button>
            </form>
        </AppDialog>
    )
}
