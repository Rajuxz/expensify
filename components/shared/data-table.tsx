"use client"
import { useMemo, useState } from "react"
import useSWR from "swr"
import { endOfDay, isWithinInterval, startOfDay, subDays } from "date-fns"
import {
    Cell,
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getCategories } from "@/actions/category"
import { Expense } from "@/types/expenseTableTypes"
import { useBulkCategoryEdit } from "@/hooks/use-bulk-category-edit"
import { BulkEditControls } from "@/components/expenses/bulk-edit-controls"
import { CategoryCellEditor } from "@/components/expenses/category-cell-editor"
import { DataTableFilters } from "./data-table-filters"
import { DataTablePagination } from "./data-table-pagination"

type DataTableProps<TData extends Expense, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData extends Expense, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [periodDays, setPeriodDays] = useState(0)
    const bulk = useBulkCategoryEdit(data)

    const { data: categories = [], isLoading: categoriesLoading } = useSWR(
        bulk.isEditing ? "categories" : null,
        getCategories
    )

    const tableData = useMemo(() => {
        if (!periodDays) return data
        // "Last 7 days" = today + the 6 days before it, whole calendar days
        const from = startOfDay(subDays(new Date(), periodDays - 1))
        const to = endOfDay(new Date())
        return data.filter((row) =>
            isWithinInterval(new Date(row.expense_date), {
                start: from,
                end: to,
            })
        )
    }, [data, periodDays])

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getRowId: (row) => row.id,
        // don't jump back to page 1 after a save refreshes the data
        autoResetPageIndex: false,
        state: {
            columnFilters,
            columnVisibility: { actions: !bulk.isEditing },
        },
    })

    const { pageIndex, pageSize } = table.getState().pagination
    const visibleColumnCount = table.getVisibleLeafColumns().length
    const paymentTypeFilter = table
        .getColumn("transaction_type")
        ?.getFilterValue() as string | undefined
    const filteredTotal = table
        .getFilteredRowModel()
        .rows.reduce((sum, row) => sum + Number(row.original.amount), 0)

    function renderCell(cell: Cell<TData, unknown>, rowIndex: number) {
        const expense = cell.row.original

        if (cell.column.id === "id") {
            return pageIndex * pageSize + rowIndex + 1
        }
        if (bulk.isEditing && cell.column.id === "category") {
            return (
                <CategoryCellEditor
                    categories={categories}
                    value={bulk.getCategoryId(expense)}
                    onChange={(id) => bulk.pickCategory(expense, id)}
                    loading={categoriesLoading}
                    disabled={bulk.saving}
                />
            )
        }
        return flexRender(cell.column.columnDef.cell, cell.getContext())
    }

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-2">
                <BulkEditControls
                    isEditing={bulk.isEditing}
                    changeCount={bulk.changeCount}
                    saving={bulk.saving}
                    disabled={data.length === 0}
                    onStart={bulk.start}
                    onSave={bulk.save}
                    onCancel={bulk.cancel}
                />
                <DataTableFilters
                    table={table}
                    periodDays={periodDays}
                    onPeriodDaysChange={setPeriodDays}
                />
            </div>
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    className={cn(
                                        bulk.isChanged(row.original) &&
                                            "bg-amber-50 dark:bg-amber-950/30"
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                cell.column.id === "id" &&
                                                    "font-medium"
                                            )}
                                        >
                                            {renderCell(cell, index)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleColumnCount}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell
                                colSpan={visibleColumnCount - 1}
                                className="font-bold"
                            >
                                Total ({paymentTypeFilter || "All"})
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                Rs. {filteredTotal.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    )
}
