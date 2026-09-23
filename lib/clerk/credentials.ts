// Credential changes for *another* user via Clerk's Backend API.
// Server-side only (needs CLERK_SECRET_KEY). Callers must authorize first.
import { clerkClient } from "@clerk/nextjs/server"

/**
 * Sets a new password, then revokes every active session of that user so
 * they must sign in again with it. Clerk still enforces its own password
 * rules (length, breached-password check) and throws if they fail.
 */
export async function setUserPassword(clerkId: string, password: string) {
    const clerk = await clerkClient()
    await clerk.users.updateUser(clerkId, { password })

    // revoke explicitly: `signOutOfOtherSessions` is relative to the caller's
    // session, and the caller here is the admin, not this user
    const { data: sessions } = await clerk.sessions.getSessionList({
        userId: clerkId,
        status: "active",
    })
    await Promise.all(sessions.map((s) => clerk.sessions.revokeSession(s.id)))
    return { revokedSessions: sessions.length }
}

/**
 * Makes `email` the user's verified primary address and removes all their
 * other addresses. The admin vouches for it, so no verification step.
 * Throws if another account already uses the address.
 */
export async function replacePrimaryEmail(clerkId: string, email: string) {
    const clerk = await clerkClient()
    const created = await clerk.emailAddresses.createEmailAddress({
        userId: clerkId,
        emailAddress: email,
        verified: true,
        primary: true,
    })

    // old addresses go only after the new one is primary, so the user is
    // never left without a login email if this fails halfway
    const user = await clerk.users.getUser(clerkId)
    await Promise.all(
        user.emailAddresses
            .filter((e) => e.id !== created.id)
            .map((e) => clerk.emailAddresses.deleteEmailAddress(e.id))
    )
}
