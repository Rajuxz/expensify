// Runnable self-check: `npx tsx lib/dates/ranges.check.ts`
// Independent of the machine's own timezone: every expectation is a UTC instant.
import assert from "node:assert/strict"
import {
    addMonthsInZone,
    dayRange,
    formatInZone,
    isValidTimeZone,
    monthRange,
    monthRangeOf,
    weekRange,
    yearRangeOf,
    zonedDayOfWeek,
    zonedYearMonth,
} from "./ranges"

const NPT = "Asia/Kathmandu" // UTC+5:45, no DST
const iso = (d: Date) => d.toISOString()

// The original bug: 20:00 UTC on Sep 23 is already Sep 24 in Nepal.
const lateUtc = new Date("2026-09-23T20:00:00Z")
{
    const { start, end } = dayRange(NPT, lateUtc)
    assert.equal(iso(start), "2026-09-23T18:15:00.000Z") // Sep 24 00:00 NPT
    assert.equal(iso(end), "2026-09-24T18:15:00.000Z")
    // same instant in UTC is still Sep 23
    assert.equal(
        iso(dayRange("UTC", lateUtc).start),
        "2026-09-23T00:00:00.000Z"
    )
}

// Month boundary: 20:00 UTC on Sep 30 is October in Nepal.
{
    const at = new Date("2026-09-30T20:00:00Z")
    assert.deepEqual(zonedYearMonth(NPT, at), { year: 2026, month: 10 })
    assert.equal(iso(monthRange(NPT, at).start), "2026-09-30T18:15:00.000Z")
    assert.equal(iso(monthRange(NPT, at, -1).start), "2026-08-31T18:15:00.000Z")
    assert.equal(iso(monthRange(NPT, at, -1).end), "2026-09-30T18:15:00.000Z")
}

// Explicit month/year
assert.equal(iso(monthRangeOf(NPT, 2026, 2).start), "2026-01-31T18:15:00.000Z")
assert.equal(iso(monthRangeOf(NPT, 2026, 2).end), "2026-02-28T18:15:00.000Z")
assert.equal(iso(yearRangeOf(NPT, 2026).start), "2025-12-31T18:15:00.000Z")
assert.equal(iso(yearRangeOf(NPT, 2026).end), "2026-12-31T18:15:00.000Z")

// Week starts Sunday in the user's zone: Thu Sep 24 NPT -> Sun Sep 20 NPT
{
    const { start, end } = weekRange(NPT, lateUtc)
    assert.equal(iso(start), "2026-09-19T18:15:00.000Z")
    assert.equal(iso(end), "2026-09-26T18:15:00.000Z")
}

// Day-of-week bucketing and formatting follow the zone, not the server
assert.equal(zonedDayOfWeek(NPT, lateUtc), 4) // Thursday in Nepal
assert.equal(zonedDayOfWeek("UTC", lateUtc), 3) // still Wednesday in UTC
assert.equal(formatInZone(lateUtc, NPT, "yyyy-MM-dd HH:mm"), "2026-09-24 01:45")

// Month-end clamping happens in the zone: Jan 31 NPT + 1 month = Feb 28 NPT
{
    const jan31 = new Date("2026-01-30T18:15:00Z") // Jan 31 00:00 NPT
    assert.equal(
        iso(addMonthsInZone(jan31, 1, NPT)),
        "2026-02-27T18:15:00.000Z" // Feb 28 00:00 NPT
    )
}

// DST zone sanity: day range across the US spring-forward is 23h long
{
    const { start, end } = dayRange(
        "America/New_York",
        new Date("2026-03-08T12:00:00Z")
    )
    assert.equal((end.getTime() - start.getTime()) / 3_600_000, 23)
}

assert.equal(isValidTimeZone(NPT), true)
assert.equal(isValidTimeZone("Mars/Olympus"), false)

console.log("ranges.check: all passed")
