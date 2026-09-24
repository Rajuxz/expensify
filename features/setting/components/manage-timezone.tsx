"use client"
// Settings card: which timezone "today" / "this month" are calculated in.
import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { setMyTimezone } from "@/actions/user/timezone"

export function ManageTimezone({ current }: { current: string }) {
    const [value, setValue] = useState(current)
    const [isPending, startTransition] = useTransition()

    // every IANA zone this browser knows
    const zones = useMemo(() => Intl.supportedValuesOf("timeZone"), [])
    // the browser's zone; read after mount (during SSR it would be the
    // server's zone and cause a hydration mismatch)
    const [detected, setDetected] = useState<string | null>(null)
    useEffect(() => {
        setDetected(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }, [])

    function save(timeZone: string) {
        startTransition(async () => {
            const result = await setMyTimezone(timeZone)
            if (!result.success) {
                toast.error(result.error ?? "Could not save timezone.")
                return
            }
            setValue(timeZone)
            toast.success(`Timezone set to ${timeZone}.`)
        })
    }

    return (
        <Card id="timezone" className="scroll-mt-20">
            <CardHeader>
                <CardTitle>Timezone</CardTitle>
                <CardDescription>
                    Used for &ldquo;today&rdquo;, &ldquo;this week&rdquo; and
                    &ldquo;this month&rdquo; on the dashboard and in reports.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Combobox
                        items={zones}
                        value={value}
                        onValueChange={(zone) => zone && save(zone)}
                        disabled={isPending}
                    >
                        <ComboboxInput
                            placeholder="Search timezone..."
                            className="w-64"
                            disabled={isPending}
                        />
                        <ComboboxContent>
                            <ComboboxEmpty>No timezone found.</ComboboxEmpty>
                            <ComboboxList>
                                {(zone: string) => (
                                    <ComboboxItem key={zone} value={zone}>
                                        {zone}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                    {detected && detected !== value && (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() => save(detected)}
                        >
                            Use this device&apos;s ({detected})
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
