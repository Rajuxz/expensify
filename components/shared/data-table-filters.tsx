"use client"
import { Table } from "@tanstack/react-table"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const paymentType = ["CASH", "ONLINE"]

// value = number of days to look back, 0 = no limit
const PERIODS = [
    { value: 0, label: "All time" },
    { value: 1, label: "Today" },
    { value: 7, label: "Last 7 days" },
    { value: 15, label: "Last 15 days" },
    { value: 30, label: "Last 30 days" },
]

type DataTableFiltersProps<TData> = {
    table: Table<TData>
    periodDays: number
    onPeriodDaysChange: (days: number) => void
}

export function DataTableFilters<TData>({
    table,
    periodDays,
    onPeriodDaysChange,
}: DataTableFiltersProps<TData>) {
    const paymentTypeFilter =
        (table.getColumn("transaction_type")?.getFilterValue() as string) ?? ""

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Select
                items={PERIODS}
                value={periodDays}
                onValueChange={(value) => {
                    onPeriodDaysChange(Number(value ?? 0))
                    table.firstPage()
                }}
            >
                <SelectTrigger className="w-36" aria-label="Period">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                            {period.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Combobox
                items={paymentType}
                value={paymentTypeFilter}
                onValueChange={(value) => {
                    table
                        .getColumn("transaction_type")
                        ?.setFilterValue(value || undefined)
                    table.firstPage()
                }}
            >
                <ComboboxInput placeholder="Payment Type" showClear />
                <ComboboxContent>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                        {(item) => (
                            <ComboboxItem key={item} value={item}>
                                {item}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    )
}
