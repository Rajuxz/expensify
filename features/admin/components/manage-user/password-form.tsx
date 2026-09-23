"use client"
// Set a new password for a user; the server signs them out everywhere.
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserPassword } from "@/actions/admin/credentials"
import pluralize from "@/lib/helpers/pluralize"

type PasswordFormProps = {
    userId: string
    onDone: () => void
}

export function PasswordForm({ userId, onDone }: PasswordFormProps) {
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [isPending, startTransition] = useTransition()

    const mismatch = confirm.length > 0 && password !== confirm
    const canSubmit = password.length >= 8 && password === confirm

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!canSubmit) return
        startTransition(async () => {
            const result = await updateUserPassword({ userId, password })
            if (!result.success) {
                toast.error(result.error ?? "Could not update password.")
                return
            }
            toast.success(
                `Password changed. Signed out of ${pluralize(result.revokedSessions ?? 0, "session")}.`
            )
            setPassword("")
            setConfirm("")
            onDone()
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <Label htmlFor="admin-password">New password</Label>
            <Input
                id="admin-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
            />
            <Input
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                aria-label="Repeat password"
                aria-invalid={mismatch}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={isPending}
            />
            {mismatch && (
                <p className="text-xs text-destructive">
                    Passwords don&apos;t match.
                </p>
            )}
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                    They&apos;ll be signed out of all devices.
                </p>
                <Button type="submit" disabled={isPending || !canSubmit}>
                    {isPending ? "Saving..." : "Set password"}
                </Button>
            </div>
        </form>
    )
}
