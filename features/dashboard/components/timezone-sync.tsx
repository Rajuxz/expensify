"use client"
// Rendered by the dashboard layout only while the user has no saved
// timezone. Sends the browser's timezone once, then refreshes so totals
// ("today", "this month") are recomputed in it. Renders nothing.
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { setMyTimezone } from "@/actions/user/timezone"

export function TimezoneSync() {
    const router = useRouter()

    useEffect(() => {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (!detected) return
        setMyTimezone(detected, { onlyIfUnset: true }).then((result) => {
            if (result.success) router.refresh()
        })
    }, [router])

    return null
}
