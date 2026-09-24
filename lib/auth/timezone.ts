// Resolves which timezone to use for a user's calendar maths.
import { DEFAULT_TIMEZONE, isValidTimeZone } from "@/lib/dates/ranges"

/** The user's saved timezone, or Asia/Kathmandu if unset/invalid. */
export function userTimeZone(user: { timezone: string | null }): string {
    return user.timezone && isValidTimeZone(user.timezone)
        ? user.timezone
        : DEFAULT_TIMEZONE
}
