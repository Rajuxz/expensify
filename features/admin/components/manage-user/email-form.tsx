"use client"
// Replace a user's login email. Takes effect immediately (no verification).
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserEmail } from "@/actions/admin/credentials"

type EmailFormProps = {
    userId: string
    currentEmail: string | null
    onDone: () => void
}

export function EmailForm({ userId, currentEmail, onDone }: EmailFormProps) {
    const [email, setEmail] = useState(currentEmail ?? "")
    const [isPending, startTransition] = useTransition()
    const unchanged = email.trim().toLowerCase() === (currentEmail ?? "")

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        startTransition(async () => {
            const result = await updateUserEmail({ userId, email })
            if (!result.success) {
                toast.error(result.error ?? "Could not update email.")
                return
            }
            toast.success("Email updated.")
            onDone()
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <Label htmlFor="admin-email">Login email</Label>
            <div className="flex gap-2">
                <Input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                />
                <Button type="submit" disabled={isPending || unchanged}>
                    {isPending ? "Saving..." : "Save email"}
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                Becomes their verified login email right away and replaces the
                old one. Double-check it — a typo locks them out of email
                sign-in.
            </p>
        </form>
    )
}
