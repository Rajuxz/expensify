// Admin panel (server component). The role check lives here, in the page,
// rather than in a layout: layouts don't re-run on every client navigation.
import { requireRole } from "@/lib/auth/require-role"
import { getAdminUsers } from "@/actions/admin/users"
import { AdminTabs } from "@/features/admin/components/admin-tabs"

export default async function AdminPage() {
    // non-admins are redirected to /dashboard
    const viewer = await requireRole("ADMIN")
    const result = await getAdminUsers()
    const isSuperAdmin = viewer.role === "SUPER_ADMIN"

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-bold">Admin</h2>
                <p className="text-sm text-muted-foreground">
                    {isSuperAdmin
                        ? "Manage roles, emails and passwords."
                        : "You have view-only admin access."}
                </p>
            </div>

            {result.success ? (
                <AdminTabs
                    users={result.data}
                    viewer={{ id: viewer.id, role: viewer.role }}
                />
            ) : (
                <p className="text-sm text-destructive">{result.error}</p>
            )}
        </div>
    )
}
