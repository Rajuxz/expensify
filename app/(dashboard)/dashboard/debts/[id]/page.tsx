// One debt (server component). getDebt() only returns the current user's
// own debts, so someone else's id is simply "not found".
import { notFound } from "next/navigation"
import { getDebt } from "@/actions/debts/queries"
import { DebtDetail } from "@/features/debts/components/detail/debt-detail"

export default async function DebtPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const debt = await getDebt(id)
    if (!debt) notFound()
    return <DebtDetail debt={debt} />
}
