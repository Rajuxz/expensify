"use server"
import requireUser from "@/lib/auth/getCurrentUser"
import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { revalidateTag, unstable_cache, updateTag } from "next/cache"

export const getCachedCategories = unstable_cache(
    async (userId: string) => {
        const categories = await prisma.categories.findMany({
            where: { userId },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        })

        return [{ id: null, name: "Uncategorized" }, ...categories]
    },
    ["categories"],
    { revalidate: 43200, tags: ["categories"] }
)

export async function getCategories() {
    const user = await requireUser()
    return getCachedCategories(user.id)
}

export async function createCategory(name: string) {
    const user = await requireUser()
    name = name.trim()
    if (!name) {
        return { success: false, error: "Category name is required" }
    }
    if (name.length > 50) {
        return { success: false, error: "Category name is too long." }
    }
    if (name.toLowerCase() === "uncategorized") {
        return { success: false, error: `"Uncategorized" is reserved.` }
    }
    try {
        const categoryExists = await prisma.categories.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                },
                userId: user.id,
            },
        })
        if (categoryExists) {
            return {
                success: false,
                error: "Category already exists.",
            }
        }
        const category = await prisma.categories.create({
            data: {
                name: name.trim(),
                userId: user.id,
            },
        })
        updateTag("categories")
        return { success: true, data: category }
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return { success: false, error: "Category already exists." }
        }
        console.error("createCategory failed:", error)
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        }
    }
}

export async function updateCategory(name: string, id: string) {
    const user = await requireUser()
    if (!name.trim() || !id) {
        return { success: false, error: "Something went wrong." }
    }

    try {
        const updatedCategory = await prisma.categories.update({
            where: { userId: user.id, id: id },
            data: {
                name: name,
            },
        })
        revalidateTag("categories", { expire: 0 })
        return { success: true, data: updatedCategory }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return { success: false, error: "Category not found." }
            }
        }
        console.error(error)
        return { success: false, error: "Cannot update category." }
    }
}
export async function deleteCategory(id: string) {
    const user = await requireUser()
    if (!id) {
        return { success: false, error: "Something went wrong." }
    }

    try {
        const category = await prisma.categories.findUnique({
            where: { id },
        })

        if (!category || category.userId !== user.id) {
            return {
                success: false,
                error: "You cannot delete the category.",
            }
        }

        await prisma.$transaction([
            prisma.expenses.updateMany({
                where: { userId: user.id, categoryId: id },
                data: { categoryId: null },
            }),
            prisma.categories.delete({ where: { id } }),
        ])

        revalidateTag("categories", { expire: 0 })

        return {
            success: true,
            error: "Category deleted successfully.",
        }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return { success: false, error: "Category Not Found." }
            }
            return { success: false, error: "Cannot Delete category." }
        }
        return { success: false, error: "Cannot Delete category." }
    }
}
