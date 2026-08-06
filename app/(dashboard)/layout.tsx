import { getMonthlyExpense } from "@/actions/expense"
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell"
import { Toaster } from "sonner"
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const now = new Date()

    const year = now.getFullYear()
    const month = now.getMonth()

    const monthlyAmount = await getMonthlyExpense(year, month)
    return (
        <DashboardShell monthlyAmount={monthlyAmount}>
            <Toaster richColors />
            {children}
        </DashboardShell>
    )
}
