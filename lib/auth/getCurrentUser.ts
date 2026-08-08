"use server"
import { prisma } from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"

export default async function requireUser() {
    const { userId: clerkId } = await auth.protect()

    const user = await prisma.users.findUnique({ where: { clerk_id: clerkId } })
    if (user) return user

    // fallback: create on first access (used by createExpense today)
    const clerkUser = await currentUser()
    return prisma.users.create({
        data: {
            clerk_id: clerkId,
            username:
                clerkUser?.username ??
                clerkUser?.emailAddresses[0]?.emailAddress ??
                clerkId,
            avatar_url: clerkUser?.imageUrl,
        },
    })
}
