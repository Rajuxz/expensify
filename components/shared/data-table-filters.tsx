"use client"
// Period + payment-type filters. Inline on md+ screens; on phones they
// collapse behind a single "Filters" button to save toolbar space.
import { Table } from "@tanstack/react-table"
import { SlidersHorizontal } from "lucide-react"
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

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

export function DataTableFilters<TData>(props: DataTableFiltersProps<TData>) {
    const paymentTypeFilter = props.table
        .getColumn("transaction_type")
        ?.getFilterValue() as string | undefined
    const activeCount = (props.periodDays ? 1 : 0) + (paymentTypeFilter ? 1 : 0)

    return (
        <>
            {/* md and up: controls inline in the toolbar */}
            <div className="hidden flex-wrap items-center gap-2 md:flex">
                <FilterControls {...props} />
            </div>

            {/* phones: one button that opens the same controls */}
            <Popover>
                <PopoverTrigger
                    render={
                        <Button
                            variant="outline"
                            size="sm"
                            className="md:hidden"
                        >
                            <SlidersHorizontal className="mr-1 h-4 w-4" />
                            Filters
                            {activeCount > 0 && (
                                <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                                    {activeCount}
                                </span>
                            )}
                        </Button>
                    }
                />
                <PopoverContent align="end" className="w-64 space-y-3 p-3">
                    <FilterControls {...props} stacked />
                </PopoverContent>
            </Popover>
        </>
    )
}

function FilterControls<TData>({
    table,
    periodDays,
    onPeriodDaysChange,
    stacked = false,
}: DataTableFiltersProps<TData> & { stacked?: boolean }) {
    const paymentTypeFilter =
        (table.getColumn("transaction_type")?.getFilterValue() as string) ?? ""
    const width = stacked ? "w-full" : undefined

    return (
        <>
            <Select
                items={PERIODS}
                value={periodDays}
                onValueChange={(value) => {
                    onPeriodDaysChange(Number(value ?? 0))
                    table.firstPage()
                }}
            >
                <SelectTrigger
                    className={stacked ? "w-full" : "w-36"}
                    aria-label="Period"
                >
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
                <ComboboxInput
                    placeholder="Payment Type"
                    showClear
                    className={width}
                />
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
        </>
    )
}
