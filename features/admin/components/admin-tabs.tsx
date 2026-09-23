"use client"
// Admin panel tabs: one tab per role, each with its own users table.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AdminUserRow } from "@/actions/admin/users"
import type { Actor } from "@/lib/admin/permissions"
import type { Role } from "@/lib/auth/roles"
import { AdminUsersTable } from "./admin-users-table"

const TABS: { role: Role; label: string; empty: string }[] = [
    { role: "USER", label: "Users", empty: "No regular users yet." },
    { role: "ADMIN", label: "Admins", empty: "No admins yet." },
    { role: "SUPER_ADMIN", label: "Super admins", empty: "No super admins." },
]

type AdminTabsProps = {
    users: AdminUserRow[]
    viewer: Actor
}

export function AdminTabs({ users, viewer }: AdminTabsProps) {
    return (
        <Tabs defaultValue="USER" className="space-y-3">
            <TabsList>
                {TABS.map(({ role, label }) => (
                    <TabsTrigger key={role} value={role}>
                        {label}
                        <span className="ml-1.5 text-muted-foreground">
                            {users.filter((u) => u.role === role).length}
                        </span>
                    </TabsTrigger>
                ))}
            </TabsList>
            {TABS.map(({ role, empty }) => (
                <TabsContent key={role} value={role}>
                    <AdminUsersTable
                        users={users.filter((u) => u.role === role)}
                        viewer={viewer}
                        emptyMessage={empty}
                    />
                </TabsContent>
            ))}
            <p className="text-xs text-muted-foreground">
                Only people who have opened the app at least once appear here.
            </p>
        </Tabs>
    )
}
