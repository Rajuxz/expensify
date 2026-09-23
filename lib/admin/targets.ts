// Loads the user an admin action is about to act on, in the shape the
// permission checks expect. Server-side only (uses Prisma).
import { prisma } from "@/lib/prisma"
import { isEnvSuperAdmin } from "@/lib/auth/roles"

export async function getTargetUser(userId: string) {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
            id: true,
            role: true,
            email: true,
            username: true,
            clerk_id: true,
        },
    })
    if (!user) return null
    return { ...user, envManaged: isEnvSuperAdmin(user.email) }
}
