import { PrismaClient } from "@/lib/generated/prisma/client"

import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
async function main() {
    console.log("Starting per user category backfill....")

    //select users
    const users = await prisma.users.findMany({
        select: {
            id: true,
            username: true,
        },
    })
    console.log(users)
    for (const user of users) {
        const usedCategoryIds = await prisma.expenses.findMany({
            where: { userId: user.id },
            select: {
                categoryId: true,
            },
            distinct: ["categoryId"],
        })

        //if no category is used, skip it
        if (usedCategoryIds.length === 0) {
            console.log(`${user.username} - no expenses : Skipping...`)
            continue
        }

        const oldCategories = await prisma.categories.findMany({
            where: { id: { in: usedCategoryIds.map((e) => e.categoryId) } },
        })

        //transaction
        await prisma.$transaction(async (tx) => {
            for (const oldCategory of oldCategories) {
                const newCategory = await tx.categories.create({
                    data: {
                        name: oldCategory.name,
                        icon: oldCategory.icon,
                        color: oldCategory.color,
                        userId: user.id,
                    },
                })

                await tx.expenses.updateMany({
                    where: { userId: user.id, categoryId: oldCategory.id },
                    data: { categoryId: newCategory.id },
                })
            }
        })
        console.log(
            `  ✓ ${user.username}: migrated ${oldCategories.length} categories`
        )
    }
    console.log("Backfill completed.")
}

main()
    .catch((err) => {
        console.error("Backfill failed:", err)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
