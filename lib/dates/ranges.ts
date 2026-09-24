// Calendar ranges ("today", "this week", "this month", ...) in a given IANA
// timezone. The ONLY place server code should turn "a calendar period" into
// UTC instants — never use setHours()/new Date(y, m, d) on the server, which
// silently uses the server's own timezone (UTC on most hosts).
//
// All ranges are half-open: { start <= t < end }. Query with gte/lt.
import { tz } from "@date-fns/tz"
import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    format,
    getDay,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
} from "date-fns"

export const DEFAULT_TIMEZONE = "Asia/Kathmandu"

export type DateRange = { start: Date; end: Date }

// date-fns returns TZDate objects; hand Prisma/serialization plain Dates.
const plain = (d: Date) => new Date(d.getTime())

/** True for any IANA name this runtime knows ("Asia/Kathmandu", "UTC"...). */
export function isValidTimeZone(timeZone: string): boolean {
    try {
        new Intl.DateTimeFormat("en-US", { timeZone })
        return true
    } catch {
        return false
    }
}

export function dayRange(timeZone: string, at = new Date()): DateRange {
    const start = startOfDay(at, { in: tz(timeZone) })
    return { start: plain(start), end: plain(addDays(start, 1)) }
}

/** Week starting Sunday (matches the dashboard's existing definition). */
export function weekRange(timeZone: string, at = new Date()): DateRange {
    const start = startOfWeek(at, { in: tz(timeZone), weekStartsOn: 0 })
    return { start: plain(start), end: plain(addWeeks(start, 1)) }
}

/** Month containing `at`; `offset` -1 = previous month, etc. */
export function monthRange(
    timeZone: string,
    at = new Date(),
    offset = 0
): DateRange {
    const start = addMonths(startOfMonth(at, { in: tz(timeZone) }), offset)
    return { start: plain(start), end: plain(addMonths(start, 1)) }
}

/** A specific month. month: 1-12. */
export function monthRangeOf(
    timeZone: string,
    year: number,
    month: number
): DateRange {
    // noon on the 1st: safely inside that month in every timezone
    const anchor = new Date(Date.UTC(year, month - 1, 1, 12))
    return monthRange(timeZone, anchor)
}

export function yearRange(timeZone: string, at = new Date()): DateRange {
    const start = startOfYear(at, { in: tz(timeZone) })
    return { start: plain(start), end: plain(addYears(start, 1)) }
}

/** A specific calendar year. */
export function yearRangeOf(timeZone: string, year: number): DateRange {
    return yearRange(timeZone, new Date(Date.UTC(year, 6, 1, 12)))
}

/** Year and month (1-12) of `at` as seen in the timezone. */
export function zonedYearMonth(timeZone: string, at = new Date()) {
    const [year, month] = format(at, "yyyy-M", { in: tz(timeZone) })
        .split("-")
        .map(Number)
    return { year, month }
}

/** Day of week (0 = Sunday) of `at` as seen in the timezone. */
export function zonedDayOfWeek(timeZone: string, at: Date): number {
    return getDay(at, { in: tz(timeZone) })
}

/** Format an instant as seen in the timezone (date-fns pattern). */
export function formatInZone(at: Date, timeZone: string, pattern: string) {
    return format(at, pattern, { in: tz(timeZone) })
}

/** Months from `start` in the timezone (keeps "same day each month"). */
export function addMonthsInZone(start: Date, months: number, timeZone: string) {
    return plain(addMonths(start, months, { in: tz(timeZone) }))
}
