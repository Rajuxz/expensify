import {
    LayoutDashboard,
    Receipt,
    Wallet,
    PieChart,
    Settings,
    DollarSignIcon,
    ShieldCheck,
} from "lucide-react"

export const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Transactions", href: "/dashboard/transactions", icon: Receipt },
    { label: "Debts", href: "/dashboard/debts", icon: DollarSignIcon },
    { label: "Reports", href: "/dashboard/reports", icon: PieChart },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

// Shown only to ADMIN / SUPER_ADMIN (decided server-side in the dashboard layout).
export const adminNavItem = {
    label: "Admin",
    href: "/dashboard/admin",
    icon: ShieldCheck,
}
