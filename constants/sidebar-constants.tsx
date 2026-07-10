import {
    LayoutDashboard,
    Receipt,
    Wallet,
    PieChart,
    Settings,
} from "lucide-react"

export const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Transactions", href: "/dashboard/transactions", icon: Receipt },
    { label: "Budgets", href: "/dashboard/budgets", icon: Wallet },
    { label: "Reports", href: "/dashboard/reports", icon: PieChart },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
]
