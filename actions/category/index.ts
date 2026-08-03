"use server"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export const getCategories = unstable_cache(
    async () => {
        return prisma.categories.findMany({
            select: { id: true, name: true, icon: false, color: false },
            orderBy: { name: "asc" },
        })
    },
    ["categories"],
    { revalidate: 43200, tags: ["categories"] }
)
