"use server"
// The current user's timezone, used for all server-side calendar ranges.
import { revalidatePath } from "next/cache"
import requireUser from "@/lib/auth/getCurrentUser"
import { prisma } from "@/lib/prisma"
import { isValidTimeZone } from "@/lib/dates/ranges"

/**
 * Save the user's IANA timezone ("Asia/Kathmandu").
 * `onlyIfUnset` = the automatic first-visit detection: never overwrite a
 * timezone the user already has (e.g. one they picked in Settings).
 */
export async function setMyTimezone(
    timeZone: string,
    { onlyIfUnset = false }: { onlyIfUnset?: boolean } = {}
) {
    const user = await requireUser()
    if (typeof timeZone !== "string" || !isValidTimeZone(timeZone)) {
        return { success: false, error: "Unknown timezone." }
    }
    if (onlyIfUnset && user.timezone !== null) return { success: true }

    await prisma.users.update({
        where: { id: user.id },
        data: { timezone: timeZone, updated_at: new Date() },
    })
    // every page's totals depend on it
    revalidatePath("/dashboard", "layout")
    return { success: true }
}
