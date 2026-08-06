"use server"
import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { ExpenseFormData } from "@/schemas/expense"
import { Expense } from "@/types/expenseTableTypes"
import { auth, currentUser } from "@clerk/nextjs/server"

export async function createExpense(input: ExpenseFormData) {
    const { userId: clerkId } = await auth.protect()

    let user = await prisma.users.findUnique({ where: { clerk_id: clerkId } })
    if (!user) {
        const clerkUser = await currentUser()
        user = await prisma.users.create({
            data: {
                clerk_id: clerkId,
                username:
                    clerkUser?.username ??
                    clerkUser?.emailAddresses[0]?.emailAddress ??
                    clerkId,
                avatar_url: clerkUser?.imageUrl,
            },
        })
    }

    // adding expenses in the database.
    try {
        const expense = await prisma.expenses.create({
            data: {
                title: input.title,
                amount: input.amount,
                description: input.description,
                expense_date: input.expense_date ?? new Date(),
                transaction_type: input.transaction_type,
                user: { connect: { id: user.id } },
                category: { connect: { id: input.categoryId } },
            },
        })

        return { success: true, data: expense }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return { success: false, error: "Invalid category or user" }
        }
        throw error
    }
}

export async function getExpenses(): Promise<Expense[]> {
    const expenses = await prisma.expenses.findMany({
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            expense_date: "desc",
        },
    })

    return expenses
}

export async function updateExpenses(
    expenseId: string,
    values: ExpenseFormData
) {
    try {
        const updatedExpense = await prisma.expenses.update({
            where: {
                id: expenseId,
            },

            data: {
                title: values.title,
                amount: values.amount,
                description: values.description,
                expense_date: values.expense_date,
                transaction_type: values.transaction_type,
                categoryId: values.categoryId,
            },

            include: {
                category: true,
            },
        })

        return {
            success: true,
            data: updatedExpense,
        }
    } catch (error) {
        console.error("Failed to update expense:", error)

        return {
            success: false,
            error: "Failed to update expense",
        }
    }
}

export async function getMonthlyExpense(year: number, month: number) {
    // month: 0 = January, 1 = February, etc.

    const startOfMonth = new Date(year, month, 1)

    const startOfNextMonth = new Date(year, month + 1, 1)

    const result = await prisma.expenses.aggregate({
        _sum: {
            amount: true,
        },

        where: {
            expense_date: {
                gte: startOfMonth,
                lt: startOfNextMonth,
            },
        },
    })

    return result._sum.amount ?? 0
}
