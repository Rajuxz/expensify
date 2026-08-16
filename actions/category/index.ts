"use server"
import requireUser from "@/lib/auth/getCurrentUser"
import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { revalidateTag, unstable_cache } from "next/cache"

export const getCachedCategories = unstable_cache(
    async (userId: string) => {
        return prisma.categories.findMany({
            where: { userId },
            select: { id: true, name: true, color: false },
            orderBy: { name: "asc" },
        })
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
    if (!name.trim()) {
        return { success: false, error: "Category name is required" }
    }

    try {
        const category = await prisma.categories.create({
            data: {
                name: name.trim(),
                userId: user.id,
            },
        })
        revalidateTag("categories", { expire: 0 })
        return { success: true, data: category }
    } catch (error) {
        return { success: false, error: "Category already exists." }
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
        const recordCount = await prisma.expenses.count({
            where: { userId: user.id, categoryId: id, isDeleted: false },
        })

        if (recordCount > 0) {
            return {
                success: false,
                error: "There are expenses available. Please recategorized first.",
            }
        } else {
            const category = await prisma.categories.findUnique({
                where: { id },
            })
            if (!category || category.userId !== user.id) {
                return {
                    success: false,
                    error: "You cannot delete the category.",
                }
            }

            await prisma.categories.delete({ where: { id } })
            revalidateTag("categories", { expire: 0 })

            return {
                success: true,
                error: "Category deleted successfully.",
            }
        }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return { success: false, error: "Category Not Found." }
            }
            return { success: false, error: "Cannot Delete category." }
        }
    }
}
