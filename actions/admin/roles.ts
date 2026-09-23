"use server"
// Role changes from the admin panel (super admins only).
import * as z from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { authorizeRole } from "@/lib/auth/require-role"
import { ASSIGNABLE_ROLES } from "@/lib/auth/roles"
import { canChangeRole } from "@/lib/admin/permissions"
import { getTargetUser } from "@/lib/admin/targets"

const setRoleSchema = z.object({
    userId: z.uuid(),
    role: z.enum(ASSIGNABLE_ROLES),
})

/**
 * Set a user's role, including granting or revoking SUPER_ADMIN.
 * Rules live in canChangeRole(): never yourself, never an env super admin.
 */
export async function setUserRole(input: z.infer<typeof setRoleSchema>) {
    const actor = await authorizeRole("SUPER_ADMIN")
    if (!actor) return { success: false, error: "Not allowed." }

    const parsed = setRoleSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: "Invalid request." }
    const { userId, role } = parsed.data

    const target = await getTargetUser(userId)
    if (!target) return { success: false, error: "User not found." }
    if (!canChangeRole(actor, target)) {
        return {
            success: false,
            error: target.envManaged
                ? "This super admin is set in SUPER_ADMIN_EMAILS and can't be changed here."
                : "You can't change this user's role.",
        }
    }
    if (target.role === role) return { success: true }

    try {
        await prisma.users.update({
            where: { id: userId },
            data: { role, updated_at: new Date() },
        })
        revalidatePath("/dashboard/admin")
        return { success: true }
    } catch (error) {
        console.error("setUserRole failed:", error)
        return { success: false, error: "Could not update role." }
    }
}
