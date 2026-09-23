// Debts list (server component). Interest is computed on read, so this
// always shows today's figures without any scheduled job.
import { getDebts } from "@/actions/debts/queries"
import { DebtsOverview } from "@/features/debts/components/debts-overview"

export default async function DebtsPage() {
    const debts = await getDebts()
    return <DebtsOverview debts={debts} />
}
