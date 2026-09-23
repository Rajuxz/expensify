"use client"
// One "Manage" dialog per user, showing only the sections the viewer is
// allowed to use (decided by lib/admin/permissions; enforced server-side).
import { useState } from "react"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import AppDialog from "@/components/shared/app-dialog"
import type { AdminUserRow } from "@/actions/admin/users"
import { RoleForm } from "./role-form"
import { EmailForm } from "./email-form"
import { PasswordForm } from "./password-form"

type ManageUserDialogProps = {
    user: AdminUserRow
    canChangeRole: boolean
    canEditCredentials: boolean
}

export function ManageUserDialog({
    user,
    canChangeRole,
    canEditCredentials,
}: ManageUserDialogProps) {
    const [open, setOpen] = useState(false)
    const close = () => setOpen(false)

    return (
        <AppDialog
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button variant="outline" size="sm">
                    <Settings2 className="mr-1 h-4 w-4" />
                    Manage
                </Button>
            }
            title={`Manage ${user.username}`}
            description={user.email ?? "No email on record"}
        >
            <div className="space-y-4">
                {canChangeRole && (
                    <RoleForm
                        userId={user.id}
                        currentRole={user.role}
                        onDone={close}
                    />
                )}

                {canEditCredentials && (
                    <>
                        <Separator />
                        <EmailForm
                            userId={user.id}
                            currentEmail={user.email}
                            onDone={close}
                        />
                        <Separator />
                        <PasswordForm userId={user.id} onDone={close} />
                    </>
                )}

                {canChangeRole && !canEditCredentials && (
                    <p className="text-xs text-muted-foreground">
                        Super admins&apos; email and password can only be
                        changed by themselves.
                    </p>
                )}
            </div>
        </AppDialog>
    )
}
