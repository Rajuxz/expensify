import { Badge } from "@/components/ui/badge"
import type { Role } from "@/lib/auth/roles"

// Human-readable role names, shared by the badge and the role picker.
export const ROLE_LABEL: Record<Role, string> = {
    SUPER_ADMIN: "Super admin",
    ADMIN: "Admin",
    USER: "User",
}

const ROLE_VARIANT: Record<Role, "default" | "secondary" | "outline"> = {
    SUPER_ADMIN: "default",
    ADMIN: "secondary",
    USER: "outline",
}

export function RoleBadge({ role }: { role: Role }) {
    return <Badge variant={ROLE_VARIANT[role]}>{ROLE_LABEL[role]}</Badge>
}
