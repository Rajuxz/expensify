"use client"
import { useEffect } from "react"
import { Table } from "@tanstack/react-table"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const PAGE_SIZES = [10, 20, 50]

export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
    const { pageIndex, pageSize } = table.getState().pagination
    const pageCount = table.getPageCount()
    const rowCount = table.getFilteredRowModel().rows.length
    const firstRow = rowCount ? pageIndex * pageSize + 1 : 0
    const lastRow = Math.min((pageIndex + 1) * pageSize, rowCount)

    // Rows can disappear (deleted, filtered) -> keep the page in range.
    useEffect(() => {
        if (pageIndex > 0 && pageIndex >= pageCount) {
            table.setPageIndex(Math.max(pageCount - 1, 0))
        }
    }, [pageIndex, pageCount, table])

    const canPrev = table.getCanPreviousPage()
    const canNext = table.getCanNextPage()
    const navButtons = [
        {
            label: "First page",
            Icon: ChevronsLeft,
            go: () => table.firstPage(),
            enabled: canPrev,
        },
        {
            label: "Previous page",
            Icon: ChevronLeft,
            go: () => table.previousPage(),
            enabled: canPrev,
        },
        {
            label: "Next page",
            Icon: ChevronRight,
            go: () => table.nextPage(),
            enabled: canNext,
        },
        {
            label: "Last page",
            Icon: ChevronsRight,
            go: () => table.lastPage(),
            enabled: canNext,
        },
    ]

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
            <span className="text-muted-foreground">
                Showing {firstRow}–{lastRow} of {rowCount}
            </span>
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Rows per page</span>
                    <Select
                        value={pageSize}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                            table.firstPage()
                        }}
                    >
                        <SelectTrigger size="sm" className="w-16">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZES.map((size) => (
                                <SelectItem key={size} value={size}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <span>
                    Page {pageCount ? pageIndex + 1 : 0} of {pageCount}
                </span>
                <div className="flex items-center gap-1">
                    {navButtons.map(({ label, Icon, go, enabled }) => (
                        <Button
                            key={label}
                            variant="outline"
                            size="icon-sm"
                            onClick={go}
                            disabled={!enabled}
                        >
                            <Icon />
                            <span className="sr-only">{label}</span>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
