"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardNavbar } from "./dashboard-navbar"
type DashboardShellProps = {
    children: React.ReactNode
    monthlyAmount: number
}
export function DashboardShell({
    children,
    monthlyAmount,
}: DashboardShellProps) {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="min-h-screen bg-muted/20">
            <DashboardSidebar
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                onMobileOpenChange={setMobileOpen}
            />

            <div
                className={cn(
                    "transition-[margin] duration-200 ease-in-out",
                    collapsed ? "lg:ml-16" : "lg:ml-60"
                )}
            >
                <DashboardNavbar
                    collapsed={collapsed}
                    onCollapsedChange={setCollapsed}
                    onMobileOpenChange={setMobileOpen}
                    monthlyAmount={monthlyAmount}
                />
                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    )
}
