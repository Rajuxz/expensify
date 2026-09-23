// Role guards. Server-side only: import from Server Components and Server
// Actions, never from client components.
import { redirect } from "next/navigation"
import requireUser from "@/lib/auth/getCurrentUser"
import { hasRole, type Role } from "@/lib/auth/roles"

/**
 * For pages/layouts: returns the user, or silently redirects to /dashboard
 * when they lack the role (so the admin area isn't advertised).
 */
export async function requireRole(minimum: Role) {
    const user = await requireUser()
    if (!hasRole(user.role, minimum)) redirect("/dashboard")
    return user
}

/**
 * For server actions: returns the user, or null when unauthorized so the
 * action can return a normal { success: false } result instead of throwing.
 */
export async function authorizeRole(minimum: Role) {
    const user = await requireUser()
    return hasRole(user.role, minimum) ? user : null
}
