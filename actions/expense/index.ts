"use server"
import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { ExpenseFormData } from "@/schemas/expense"
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
            // e.g. P2003 = foreign key constraint failed
            return { success: false, error: "Invalid category or user" }
        }
        throw error
    }
}
