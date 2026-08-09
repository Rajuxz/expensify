"use client"
import { useMemo, useState } from "react"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

import { Field, FieldContent } from "@/components/ui/field"
import {
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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}
const paymentType = ["", "CASH", "ONLINE"]

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [todayOnly, setTodayOnly] = useState(false)

    const tableData = useMemo(() => {
        if (!todayOnly) return data
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return data.filter((row) => {
            const rowDate = new Date((row as any).expense_date)
            rowDate.setHours(0, 0, 0, 0)
            return rowDate.getTime() === today.getTime()
        })
    }, [data, todayOnly])
    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        state: {
            columnFilters,
        },
    })

    const filteredTotal = useMemo(() => {
        return table
            .getFilteredRowModel()
            .rows.reduce(
                (sum, row) => sum + (row.getValue("amount") as number),
                0
            )
    }, [table.getFilteredRowModel().rows])

    const paymentTypeFilter =
        (table.getColumn("transaction_type")?.getFilterValue() as string) ?? ""

    return (
        <div>
            <div className="flex items-center justify-end py-1">
                <Field orientation="horizontal">
                    <Checkbox
                        id="today-spending"
                        checked={todayOnly}
                        onCheckedChange={(checked) =>
                            setTodayOnly(checked === true)
                        }
                        name="today-spending"
                    />
                    <Label htmlFor="today-spending">Today's Spending</Label>
                </Field>
                <Combobox
                    items={paymentType}
                    value={paymentTypeFilter}
                    onValueChange={(value) =>
                        table
                            .getColumn("transaction_type")
                            ?.setFilterValue(value || undefined)
                    }
                >
                    <ComboboxInput placeholder="Payment Type" />
                    <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(item) => (
                                <ComboboxItem key={item} value={item}>
                                    {item == "" ? "All" : item}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>
            <div className="overflow-hidden rounded-md border">
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
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        if (cell.column.id === "id") {
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className="font-medium"
                                                >
                                                    {index + 1}
                                                </TableCell>
                                            )
                                        }
                                        return (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
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
                                colSpan={columns.length - 1}
                                className="font-bold"
                            >
                                Total{" "}
                                {paymentTypeFilter
                                    ? `(${paymentTypeFilter})`
                                    : "(All)"}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                Rs. {filteredTotal.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
