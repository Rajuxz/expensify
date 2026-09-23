"use server"
// Read side of the admin panel. Every action re-checks the caller's role.
import { prisma } from "@/lib/prisma"
import { authorizeRole } from "@/lib/auth/require-role"
import { isEnvSuperAdmin, type Role } from "@/lib/auth/roles"

export type AdminUserRow = {
    id: string
    username: string
    role: Role
    created_at: Date
    // only sent to super admins (they're the ones who can change it)
    email: string | null
    // permanent super admin from SUPER_ADMIN_EMAILS
    envManaged: boolean
}

/**
 * Users list for the admin panel (ADMIN and above).
 * Identity + role only — never expense data, which is private to each user.
 */
export async function getAdminUsers(): Promise<
    { success: true; data: AdminUserRow[] } | { success: false; error: string }
> {
    const viewer = await authorizeRole("ADMIN")
    if (!viewer) return { success: false, error: "Not allowed." }
    const showEmail = viewer.role === "SUPER_ADMIN"

    const users = await prisma.users.findMany({
        select: {
            id: true,
            username: true,
            role: true,
            created_at: true,
            email: true,
        },
        orderBy: { created_at: "desc" },
    })

    return {
        success: true,
        data: users.map((u) => ({
            ...u,
            email: showEmail ? u.email : null,
            envManaged: isEnvSuperAdmin(u.email),
        })),
    }
}
