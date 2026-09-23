"use client"
// Pick a new role for one user. Granting SUPER_ADMIN shows an extra warning.
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { setUserRole } from "@/actions/admin/roles"
import { ASSIGNABLE_ROLES, type Role } from "@/lib/auth/roles"
import { ROLE_LABEL } from "../role-badge"

// what each role can do, shown under the picker
const ROLE_HINT: Record<Role, string> = {
    USER: "Regular account. No access to the admin panel.",
    ADMIN: "Can view the admin panel (users and roles). Can't change anything.",
    SUPER_ADMIN:
        "Full control: can change roles, emails and passwords of users and admins. Only grant this to people you fully trust.",
}

const ROLE_ITEMS = ASSIGNABLE_ROLES.map((r) => ({
    value: r,
    label: ROLE_LABEL[r],
}))

type RoleFormProps = {
    userId: string
    currentRole: Role
    onDone: () => void
}

export function RoleForm({ userId, currentRole, onDone }: RoleFormProps) {
    const [role, setRole] = useState<Role>(currentRole)
    const [isPending, startTransition] = useTransition()

    function handleSave() {
        startTransition(async () => {
            const result = await setUserRole({ userId, role })
            if (!result.success) {
                toast.error(result.error ?? "Could not update role.")
                return
            }
            toast.success(`Role changed to ${ROLE_LABEL[role]}.`)
            onDone()
        })
    }

    return (
        <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex gap-2">
                <Select
                    items={ROLE_ITEMS}
                    value={role}
                    onValueChange={(value) => value && setRole(value as Role)}
                    disabled={isPending}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ROLE_ITEMS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    onClick={handleSave}
                    disabled={isPending || role === currentRole}
                >
                    {isPending ? "Saving..." : "Save role"}
                </Button>
            </div>
            <p
                className={
                    role === "SUPER_ADMIN" && currentRole !== "SUPER_ADMIN"
                        ? "text-xs text-destructive"
                        : "text-xs text-muted-foreground"
                }
            >
                {ROLE_HINT[role]}
            </p>
        </div>
    )
}
