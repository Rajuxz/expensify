import { PrismaClient } from "@/lib/generated/prisma/client"

import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const categories = [
    { name: "Food", icon: "utensils", color: "#F97316" },
    { name: "Transport", icon: "car", color: "#3B82F6" },
    { name: "Shopping", icon: "shopping-bag", color: "#EC4899" },
    { name: "Entertainment", icon: "film", color: "#8B5CF6" },
    { name: "Bills", icon: "receipt", color: "#EF4444" },
    { name: "Health", icon: "heart-pulse", color: "#10B981" },
    { name: "Groceries", icon: "shopping-cart", color: "#22C55E" },
    { name: "Other", icon: "circle-ellipsis", color: "#6B7280" },
]

async function main() {
    console.log("Seeding categories...")

    for (const category of categories) {
        const result = await prisma.categories.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        })
        console.log(`  ✓ ${result.name}`)
    }

    console.log("Seeding complete.")
}

main()
    .catch((err) => {
        console.error("Seed failed:", err)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
