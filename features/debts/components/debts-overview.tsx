"use client"
// Debts list page: totals, "I owe" / "Owed to me" tabs, add button.
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DebtView } from "@/lib/debts/serialize"
import { DIRECTION, type Direction } from "../constants"
import { DebtCard } from "./debt-card"
import { DebtFormDialog } from "./debt-form-dialog"
import { DebtsSummary } from "./debts-summary"

export function DebtsOverview({ debts }: { debts: DebtView[] }) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-xl font-bold">Debts</h2>
                    <p className="text-sm text-muted-foreground">
                        Interest is added automatically every month.
                    </p>
                </div>
                <DebtFormDialog
                    trigger={
                        <Button size="sm">
                            <Plus className="mr-1 h-4 w-4" />
                            Add debt
                        </Button>
                    }
                />
            </div>

            <DebtsSummary debts={debts} />

            <Tabs defaultValue="BORROWED" className="space-y-3">
                <TabsList>
                    {(Object.keys(DIRECTION) as Direction[]).map((d) => (
                        <TabsTrigger key={d} value={d}>
                            {DIRECTION[d].tab}
                            <span className="ml-1.5 text-muted-foreground">
                                {debts.filter((x) => x.direction === d).length}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>
                {(Object.keys(DIRECTION) as Direction[]).map((d) => (
                    <TabsContent key={d} value={d}>
                        <DebtList
                            debts={debts.filter((x) => x.direction === d)}
                            direction={d}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

// open debts first, settled ones collapsed underneath
function DebtList({
    debts,
    direction,
}: {
    debts: DebtView[]
    direction: Direction
}) {
    const open = debts.filter((d) => !d.state.isSettled)
    const settled = debts.filter((d) => d.state.isSettled)

    if (debts.length === 0) {
        return (
            <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                    Nothing here yet.
                </p>
                <DebtFormDialog
                    defaultDirection={direction}
                    trigger={
                        <Button variant="outline" size="sm" className="mt-3">
                            <Plus className="mr-1 h-4 w-4" />
                            Add {DIRECTION[direction].short.toLowerCase()} debt
                        </Button>
                    }
                />
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {open.map((d) => (
                <DebtCard key={d.id} debt={d} />
            ))}
            {settled.length > 0 && (
                <details className="pt-2">
                    <summary className="cursor-pointer text-sm text-muted-foreground">
                        Settled ({settled.length})
                    </summary>
                    <div className="mt-2 space-y-2">
                        {settled.map((d) => (
                            <DebtCard key={d.id} debt={d} />
                        ))}
                    </div>
                </details>
            )}
        </div>
    )
}
