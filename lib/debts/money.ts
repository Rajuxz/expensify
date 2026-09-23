// Money helpers for the debts module. All math runs in paisa (integer,
// 1 rupee = 100 paisa) so repeated monthly interest doesn't drift.

export const toPaisa = (rupees: number) => Math.round(rupees * 100)
export const toRupees = (paisa: number) => paisa / 100

/** "Rs. 1,234.50" — always two decimals for debt amounts. */
export function formatRs(rupees: number) {
    return `Rs. ${rupees.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`
}
