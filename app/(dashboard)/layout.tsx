import { getMonthlyExpense } from "@/actions/expense/stats"
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell"
import requireUser from "@/lib/auth/getCurrentUser"
import { hasRole } from "@/lib/auth/roles"
import { Toaster } from "sonner"
import { TimezoneSync } from "@/features/dashboard/components/timezone-sync"
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // "this month" is resolved in the user's timezone inside the action
    const [monthlyAmount, viewer] = await Promise.all([
        getMonthlyExpense(),
        requireUser(),
    ])
    return (
        <DashboardShell
            monthlyAmount={monthlyAmount}
            // UI hint only — /dashboard/admin enforces the role itself
            showAdminLink={hasRole(viewer.role, "ADMIN")}
        >
            <Toaster richColors />
            {/* first visit only: save the browser's timezone */}
            {viewer.timezone === null && <TimezoneSync />}
            {children}
        </DashboardShell>
    )
}
