"use server"
import requireUser from "@/lib/auth/getCurrentUser"
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
        revalidateTag("categories", "max")
        return { success: true, data: category }
    } catch (error) {
        return { success: false, error: "Category already exists." }
    }
}
