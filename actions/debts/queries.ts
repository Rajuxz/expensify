"use server"
// Read side of the debts module. Always scoped to the current user.
import * as z from "zod"
import requireUser from "@/lib/auth/getCurrentUser"
import { prisma } from "@/lib/prisma"
import { serializeDebt, type DebtView } from "@/lib/debts/serialize"

/** All debts of the current user, each with its computed balance. */
export async function getDebts(): Promise<DebtView[]> {
    const user = await requireUser()
    const debts = await prisma.debts.findMany({
        where: { userId: user.id },
        include: { payments: true },
        orderBy: { start_date: "desc" },
    })
    return debts.map((d) => serializeDebt(d))
}

/** One debt with payments + full interest timeline, or null if not theirs. */
export async function getDebt(id: string): Promise<DebtView | null> {
    if (!z.uuid().safeParse(id).success) return null
    const user = await requireUser()
    const debt = await prisma.debts.findFirst({
        where: { id, userId: user.id },
        include: { payments: true },
    })
    return debt ? serializeDebt(debt) : null
}
