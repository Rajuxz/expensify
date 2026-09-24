// Money helpers for the debts module. Paisa conversion lives in lib/money.ts
// (shared app-wide); this adds the debts-specific display format.
export { toPaisa, toRupees } from "@/lib/money"

/** "Rs. 1,234.50" — always two decimals for debt amounts. */
export function formatRs(rupees: number) {
    return `Rs. ${rupees.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`
}
