"use client"
// Users list for one admin tab. Search is client-side over the loaded list.
import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { AdminUserRow } from "@/actions/admin/users"
import {
    canChangeRole,
    canEditCredentials,
    type Actor,
} from "@/lib/admin/permissions"
import { RoleBadge } from "./role-badge"
import { ManageUserDialog } from "./manage-user/manage-user-dialog"

type AdminUsersTableProps = {
    users: AdminUserRow[]
    viewer: Actor
    emptyMessage: string
}

export function AdminUsersTable({
    users,
    viewer,
    emptyMessage,
}: AdminUsersTableProps) {
    const [query, setQuery] = useState("")
    const isSuperAdmin = viewer.role === "SUPER_ADMIN"
    const columnCount = isSuperAdmin ? 5 : 3

    // ponytail: loads every user and filters in the browser; move search +
    // pagination into getAdminUsers once the user count reaches the thousands.
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return users
        return users.filter(
            (u) =>
                u.username.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q)
        )
    }, [users, query])

    // why a row has no "Manage" button
    function rowNote(user: AdminUserRow) {
        if (user.id === viewer.id) return "You"
        if (user.envManaged) return "Managed via env"
        return null
    }

    return (
        <div className="space-y-3">
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                    isSuperAdmin
                        ? "Search by username or email..."
                        : "Search by username..."
                }
                aria-label="Search users"
                className="max-w-xs"
            />
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Username</TableHead>
                            {isSuperAdmin && <TableHead>Email</TableHead>}
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            {isSuperAdmin && (
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visible.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columnCount}
                                    className="h-20 text-center text-muted-foreground"
                                >
                                    {query ? "No matches." : emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            visible.map((user) => {
                                const roleOk = canChangeRole(viewer, user)
                                const credsOk = canEditCredentials(viewer, user)
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.username}
                                        </TableCell>
                                        {isSuperAdmin && (
                                            <TableCell className="text-muted-foreground">
                                                {user.email ?? "—"}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <RoleBadge role={user.role} />
                                        </TableCell>
                                        <TableCell>
                                            {format(
                                                new Date(user.created_at),
                                                "MMM d, yyyy"
                                            )}
                                        </TableCell>
                                        {isSuperAdmin && (
                                            <TableCell className="text-right">
                                                {roleOk || credsOk ? (
                                                    <ManageUserDialog
                                                        user={user}
                                                        canChangeRole={roleOk}
                                                        canEditCredentials={
                                                            credsOk
                                                        }
                                                    />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        {rowNote(user)}
                                                    </span>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
