// Who may do what to whom in the admin panel. Pure functions: the server
// actions use them to enforce, the UI uses them only to decide what to show.
import type { Role } from "@/lib/auth/roles"

export type Actor = { id: string; role: Role }

export type Target = {
    id: string
    role: Role
    // true when the target's email is in SUPER_ADMIN_EMAILS (permanent)
    envManaged: boolean
}

/**
 * Change someone's role (incl. granting/revoking SUPER_ADMIN).
 * Super admins only; never yourself; never an env-managed super admin.
 */
export function canChangeRole(actor: Actor, target: Target): boolean {
    return (
        actor.role === "SUPER_ADMIN" &&
        actor.id !== target.id &&
        !target.envManaged
    )
}

/**
 * Change someone's email or password.
 * Super admins only, and only for USER / ADMIN accounts — super admins'
 * credentials are off-limits so one compromised super admin can't take
 * over the others. Never yourself (use your own profile for that).
 */
export function canEditCredentials(actor: Actor, target: Target): boolean {
    return (
        actor.role === "SUPER_ADMIN" &&
        actor.id !== target.id &&
        target.role !== "SUPER_ADMIN"
    )
}
