"use client"
// "⋮" menu for one expense on small screens: Edit / Delete.
// The dialogs sit outside the popover so closing the menu doesn't unmount them.
import { useState } from "react"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Expense } from "@/types/expenseTableTypes"
import ExpenseForm from "./expense-form"
import { DeleteExpenseButton } from "./delete-expense-button"

export function ExpenseRowMenu({ expense }: { expense: Expense }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [dialog, setDialog] = useState<"edit" | "delete" | null>(null)

    function openDialog(which: "edit" | "delete") {
        setMenuOpen(false)
        setDialog(which)
    }

    return (
        <>
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverTrigger
                    render={
                        <Button variant="ghost" size="icon" className="-mr-2">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">
                                Actions for {expense.title}
                            </span>
                        </Button>
                    }
                />
                <PopoverContent align="end" className="w-36 p-1">
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => openDialog("edit")}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => openDialog("delete")}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </PopoverContent>
            </Popover>

            <Dialog
                open={dialog !== null}
                onOpenChange={(open) => !open && setDialog(null)}
            >
                <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {dialog === "edit"
                                ? "Update Expense"
                                : "Delete Expense?"}
                        </DialogTitle>
                        <DialogDescription>
                            {dialog === "edit"
                                ? "Update the details for your expense."
                                : "This action cannot be undone."}
                        </DialogDescription>
                    </DialogHeader>
                    {dialog === "edit" && <ExpenseForm initialData={expense} />}
                    {dialog === "delete" && (
                        <DeleteExpenseButton id={expense.id} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
