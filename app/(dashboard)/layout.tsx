import { getMonthlyExpense } from "@/actions/expense"
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell"
import requireUser from "@/lib/auth/getCurrentUser"
import { hasRole } from "@/lib/auth/roles"
import { Toaster } from "sonner"
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const now = new Date()

    const year = now.getFullYear()
    const month = now.getMonth()

    const [monthlyAmount, viewer] = await Promise.all([
        getMonthlyExpense(year, month),
        requireUser(),
    ])
    return (
        <DashboardShell
            monthlyAmount={monthlyAmount}
            // UI hint only — /dashboard/admin enforces the role itself
            showAdminLink={hasRole(viewer.role, "ADMIN")}
        >
            <Toaster richColors />
            {children}
        </DashboardShell>
    )
}
