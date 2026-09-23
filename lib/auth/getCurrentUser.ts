"use server"
import { prisma } from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"
import { resolveSuperAdminRole } from "@/lib/auth/roles"

// Primary email, only if verified — an unverified address must never be
// able to claim a SUPER_ADMIN_EMAILS entry.
function verifiedEmail(
    clerkUser: Awaited<ReturnType<typeof currentUser>>
): string | null {
    const primary = clerkUser?.primaryEmailAddress
    return primary?.verification?.status === "verified"
        ? primary.emailAddress.toLowerCase()
        : null
}

export default async function requireUser() {
    const { userId: clerkId } = await auth.protect()

    let user = await prisma.users.findUnique({ where: { clerk_id: clerkId } })

    if (!user) {
        // fallback: create on first access (used by createExpense today)
        const clerkUser = await currentUser()
        user = await prisma.users.upsert({
            where: { clerk_id: clerkId },
            update: {},
            create: {
                clerk_id: clerkId,
                username:
                    clerkUser?.username ??
                    clerkUser?.emailAddresses[0]?.emailAddress ??
                    clerkId,
                avatar_url: clerkUser?.imageUrl,
                email: verifiedEmail(clerkUser),
            },
        })
    } else if (user.email === null) {
        // one-time backfill for users created before emails were stored;
        // afterwards no Clerk API call is needed per request
        const email = verifiedEmail(await currentUser())
        if (email) {
            user = await prisma.users.update({
                where: { id: user.id },
                data: { email },
            })
        }
    }

    // keep SUPER_ADMIN in sync with the env var (writes only on change)
    const nextRole = resolveSuperAdminRole(user.role, user.email)
    if (nextRole) {
        user = await prisma.users.update({
            where: { id: user.id },
            data: { role: nextRole },
        })
    }

    return user
}
