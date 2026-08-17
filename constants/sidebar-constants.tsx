import {
    LayoutDashboard,
    Receipt,
    Wallet,
    PieChart,
    Settings,
    DollarSignIcon,
} from "lucide-react"

export const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Transactions", href: "/dashboard/transactions", icon: Receipt },
    { label: "Debts", href: "/dashboard/debts", icon: DollarSignIcon },
    { label: "Reports", href: "/dashboard/reports", icon: PieChart },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
]
