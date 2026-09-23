"use server"
// Change another user's email or password (super admins only, and only for
// USER / ADMIN accounts — see canEditCredentials()).
import * as z from "zod"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { authorizeRole } from "@/lib/auth/require-role"
import { canEditCredentials } from "@/lib/admin/permissions"
import { getTargetUser } from "@/lib/admin/targets"
import { replacePrimaryEmail, setUserPassword } from "@/lib/clerk/credentials"
import { clerkErrorMessage } from "@/lib/clerk/errors"

// Shared gate: caller is super admin AND allowed to touch this target.
async function authorizeCredentialChange(userId: string) {
    const actor = await authorizeRole("SUPER_ADMIN")
    if (!actor) return { error: "Not allowed." } as const

    const target = await getTargetUser(userId)
    if (!target) return { error: "User not found." } as const
    if (!canEditCredentials(actor, target)) {
        return {
            error: "Super admins' credentials can't be changed from here.",
        } as const
    }
    return { target } as const
}

const emailSchema = z.object({
    userId: z.uuid(),
    email: z.email("Enter a valid email address.").max(254),
})

/** Replace the user's login email (becomes verified primary immediately). */
export async function updateUserEmail(input: z.infer<typeof emailSchema>) {
    const parsed = emailSchema.safeParse(input)
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid request.",
        }
    }
    const email = parsed.data.email.trim().toLowerCase()

    const gate = await authorizeCredentialChange(parsed.data.userId)
    if ("error" in gate) return { success: false, error: gate.error }
    const { target } = gate

    if (target.email === email) {
        return { success: false, error: "That is already their email." }
    }

    try {
        await replacePrimaryEmail(target.clerk_id, email)
    } catch (error) {
        console.error("updateUserEmail (Clerk) failed:", error)
        return {
            success: false,
            error: clerkErrorMessage(error, "Could not update email."),
        }
    }

    // Clerk is the source of truth for login; keep our copy in sync for
    // SUPER_ADMIN_EMAILS matching and the admin list
    await prisma.users.update({
        where: { id: target.id },
        data: { email, updated_at: new Date() },
    })
    revalidatePath("/dashboard/admin")
    return { success: true }
}

const passwordSchema = z.object({
    userId: z.uuid(),
    // Clerk enforces its own policy too; this is the first line of defence
    password: z
        .string()
        .min(8, "Use at least 8 characters.")
        .max(72, "Use at most 72 characters."),
})

/** Set a new password and sign the user out of every device. */
export async function updateUserPassword(
    input: z.infer<typeof passwordSchema>
) {
    const parsed = passwordSchema.safeParse(input)
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid request.",
        }
    }

    const gate = await authorizeCredentialChange(parsed.data.userId)
    if ("error" in gate) return { success: false, error: gate.error }

    try {
        const { revokedSessions } = await setUserPassword(
            gate.target.clerk_id,
            parsed.data.password
        )
        return { success: true, revokedSessions }
    } catch (error) {
        // never log the password itself
        console.error("updateUserPassword (Clerk) failed:", error)
        return {
            success: false,
            error: clerkErrorMessage(error, "Could not update password."),
        }
    }
}
