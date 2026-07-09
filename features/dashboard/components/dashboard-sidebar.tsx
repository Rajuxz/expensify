"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Receipt,
    Wallet,
    PieChart,
    Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Transactions", href: "/dashboard/transactions", icon: Receipt },
    { label: "Budgets", href: "/dashboard/budgets", icon: Wallet },
    { label: "Reports", href: "/dashboard/reports", icon: PieChart },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

function NavLinks({
    collapsed,
    onNavigate,
}: {
    collapsed: boolean
    onNavigate?: () => void
}) {
    const pathname = usePathname()

    return (
        <nav className="flex flex-col gap-1 px-2">
            {navItems.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href

                const link = (
                    <Link
                        href={href}
                        onClick={onNavigate}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground",
                            collapsed && "justify-center px-0"
                        )}
                    >
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        {!collapsed && (
                            <span className="truncate">{label}</span>
                        )}
                    </Link>
                )

                if (!collapsed) {
                    return <div key={href}>{link}</div>
                }

                return (
                    <Tooltip key={href}>
                        <TooltipTrigger render={link}></TooltipTrigger>
                        <TooltipContent side="right">{label}</TooltipContent>
                    </Tooltip>
                )
            })}
        </nav>
    )
}

export function DashboardSidebar({
    collapsed,
    mobileOpen,
    onMobileOpenChange,
}: {
    collapsed: boolean
    mobileOpen: boolean
    onMobileOpenChange: (open: boolean) => void
}) {
    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={cn(
                    "hidden border-r bg-background lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col",
                    "transition-[width] duration-200 ease-in-out",
                    collapsed ? "lg:w-16" : "lg:w-60"
                )}
            >
                <div
                    className={cn(
                        "flex h-14 items-center border-b px-4",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <Wallet className="h-5 w-5 shrink-0 text-primary" />
                    {!collapsed && (
                        <span className="ml-2 truncate font-semibold tracking-tight">
                            Expensify
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto py-3">
                    <NavLinks collapsed={collapsed} />
                </div>
            </aside>

            {/* Mobile sidebar */}
            <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetHeader className="h-14 flex-row items-center justify-start space-y-0 border-b px-4">
                        <Wallet className="h-5 w-5 shrink-0 text-primary" />
                        <SheetTitle className="ml-2 text-base font-semibold tracking-tight">
                            Expensify
                        </SheetTitle>
                    </SheetHeader>

                    <div className="py-3">
                        <NavLinks
                            collapsed={false}
                            onNavigate={() => onMobileOpenChange(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
