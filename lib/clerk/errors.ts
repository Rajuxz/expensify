// Turns a Clerk Backend API error into a message safe to show an admin
// (e.g. "Password has been found in an online data breach").
import { isClerkAPIResponseError } from "@clerk/nextjs/errors"

export function clerkErrorMessage(error: unknown, fallback: string): string {
    if (isClerkAPIResponseError(error)) {
        const first = error.errors[0]
        return first?.longMessage ?? first?.message ?? fallback
    }
    return fallback
}
