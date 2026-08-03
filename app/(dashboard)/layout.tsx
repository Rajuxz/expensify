import { DashboardShell } from "@/features/dashboard/components/dashboard-shell"
import { Toaster } from "sonner"
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DashboardShell>
            <Toaster />
            {children}
        </DashboardShell>
    )
}
