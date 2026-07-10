"use client"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"

const CATEGORIES = ["Food", "Transport"] as const
const TRANSACTION_TYPES = ["Online", "Cash"] as const

type ExpenseFormProps = {
    onSubmit?: (data: {
        title: string
        amount: string
        date: Date | undefined
        transactionType: string
        category: string
        description: string
    }) => void
}

const ExpenseForm = ({ onSubmit }: ExpenseFormProps) => {
    const [title, setTitle] = React.useState("")
    const [amount, setAmount] = React.useState("")
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [transactionType, setTransactionType] = React.useState<string>(
        TRANSACTION_TYPES[0]
    )
    const [category, setCategory] = React.useState<string>("")
    const [description, setDescription] = React.useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log(e)
    }
    return (
        <Card className="w-full sm:max-w-md px-2">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title & Amount */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Groceries"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                </div>

                {/* Date & Transaction Type */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Expense Date</Label>
                        <Popover>
                            <PopoverTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date
                                            ? format(date, "PPP")
                                            : "Pick a date"}
                                    </Button>
                                }
                            />
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Transaction Type</Label>
                        <div className="flex gap-2">
                            {TRANSACTION_TYPES.map((type) => (
                                <Button
                                    key={type}
                                    type="button"
                                    variant={
                                        transactionType === type
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setTransactionType(type)}
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                    <Label>Category</Label>
                    <div className="flex gap-2">
                        {CATEGORIES.map((cat) => (
                            <Badge
                                key={cat}
                                variant={
                                    category === cat ? "default" : "outline"
                                }
                                className="cursor-pointer px-3 py-1"
                                onClick={() => setCategory(cat)}
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        className="resize-none"
                        id="description"
                        placeholder="Add any notes..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <Button type="submit" className="w-full">
                    Save Expense
                </Button>
            </form>
        </Card>
    )
}

export default ExpenseForm
