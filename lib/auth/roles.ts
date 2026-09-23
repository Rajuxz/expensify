// Role rules, kept free of DB/framework imports so they're easy to reason
// about and test. Server-side only in practice (reads process.env).
import type { Roles } from "@/lib/generated/prisma/enums"

export type Role = Roles

// Higher number = more access. hasRole() compares against this.
const ROLE_RANK: Record<Role, number> = {
    USER: 0,
    ADMIN: 1,
    SUPER_ADMIN: 2,
}

/** True if `role` is at least as powerful as `minimum`. */
export function hasRole(role: Role, minimum: Role): boolean {
    return ROLE_RANK[role] >= ROLE_RANK[minimum]
}

/**
 * Emails listed in SUPER_ADMIN_EMAILS (comma-separated), lowercased.
 * Example: SUPER_ADMIN_EMAILS="owner@example.com, cto@example.com"
 */
export function getSuperAdminEmails(
    raw = process.env.SUPER_ADMIN_EMAILS
): Set<string> {
    return new Set(
        (raw ?? "")
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean)
    )
}

/**
 * True if this email is in SUPER_ADMIN_EMAILS. Such super admins are
 * permanent: the UI can't demote them or change their credentials.
 */
export function isEnvSuperAdmin(
    email: string | null,
    superAdminEmails = getSuperAdminEmails()
): boolean {
    return !!email && superAdminEmails.has(email.toLowerCase())
}

/**
 * Two sources of SUPER_ADMIN:
 * - SUPER_ADMIN_EMAILS (permanent) -> a listed email is always promoted
 * - granted from the admin panel (revocable) -> stored in the DB only
 * So this only ever promotes; it never demotes. Removing an email from the
 * env turns that person into a regular, UI-revocable super admin.
 *
 * Returns the role the user should have, or null if nothing changes.
 */
export function resolveSuperAdminRole(
    currentRole: Role,
    email: string | null,
    superAdminEmails = getSuperAdminEmails()
): Role | null {
    if (currentRole === "SUPER_ADMIN") return null
    return isEnvSuperAdmin(email, superAdminEmails) ? "SUPER_ADMIN" : null
}

// Roles the admin panel is allowed to assign (SUPER_ADMIN included now).
export const ASSIGNABLE_ROLES = ["USER", "ADMIN", "SUPER_ADMIN"] as const
