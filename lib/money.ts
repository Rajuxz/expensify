// Money helpers shared by the whole app. Amounts are stored as
// DECIMAL(12,2) in Postgres; in JS we add them up in paisa (integers,
// 1 rupee = 100 paisa) so totals never pick up float drift.

export const toPaisa = (rupees: number) => Math.round(rupees * 100)
export const toRupees = (paisa: number) => paisa / 100

/**
 * Prisma returns DECIMAL columns as Decimal objects, which can't be sent to
 * client components. Convert at the server boundary with this.
 */
export function decimalToNumber(
    value: { toNumber(): number } | number | null | undefined
): number {
    if (value == null) return 0
    return typeof value === "number" ? value : value.toNumber()
}

/** Exact sum of rupee amounts (adds in paisa). */
export function sumAmounts(amounts: Iterable<number>): number {
    let paisa = 0
    for (const a of amounts) paisa += toPaisa(a)
    return toRupees(paisa)
}
