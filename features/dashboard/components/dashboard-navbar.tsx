"use client"

import { Menu, PanelLeftClose, PanelLeftOpen, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DashboardNavbar({
    collapsed,
    onCollapsedChange,
    onMobileOpenChange,
}: {
    collapsed: boolean
    onCollapsedChange: (collapsed: boolean) => void
    onMobileOpenChange: (open: boolean) => void
}) {
    return (
        <header className="sticky top-0 z-20 flex h-14 items-center gap-1 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-4">
            {/* Mobile: opens the Sheet drawer */}
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => onMobileOpenChange(true)}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
            </Button>

            {/* Desktop: collapses sidebar to icons-only */}
            <Button
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex"
                onClick={() => onCollapsedChange(!collapsed)}
            >
                {collapsed ? (
                    <PanelLeftOpen className="h-5 w-5" />
                ) : (
                    <PanelLeftClose className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle sidebar</span>
            </Button>

            

            <div className="flex-1" />

            <Button variant="ghost" size="icon">
                <Bell className="h-4.5 w-4.5" />
                <span className="sr-only">Notifications</span>
            </Button>

            
            <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">RJ</AvatarFallback>
            </Avatar>
        </header>
    )
}
