"use client"

import { Menu, PanelLeftClose, PanelLeftOpen, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import ExpenseForm from "@/components/expenses/expense-form"
import AppDialog from "@/components/shared/app-dialog"
import { getMonthlyExpense } from "@/actions/expense"
export function DashboardNavbar({
    collapsed,
    onCollapsedChange,
    onMobileOpenChange,
    monthlyAmount,
}: {
    collapsed: boolean
    onCollapsedChange: (collapsed: boolean) => void
    onMobileOpenChange: (open: boolean) => void
    monthlyAmount: number
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

            {/* Balance placeholder */}
            <Tooltip>
                <TooltipTrigger>
                    <div className="hidden  cursor-pointer items-center rounded-md border bg-muted/50 px-3 py-1.5 text-sm font-medium sm:flex">
                        <span className="text-green-700">
                            Rs. {monthlyAmount ?? 0}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>Total Expenses</TooltipContent>
            </Tooltip>

            {/* Add Expense */}
            <Tooltip>
                <TooltipTrigger
                    render={
                        <AppDialog
                            trigger={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 hidden sm:flex cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            }
                            title="Add Expense"
                            description="Enter the details for your new expense."
                        >
                            <ExpenseForm />
                        </AppDialog>
                    }
                />
                <TooltipContent>Add Expenses</TooltipContent>
            </Tooltip>

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
