// Wording for the two debt directions, used across the debts UI.
export const DIRECTION = {
    BORROWED: {
        tab: "I owe",
        short: "Borrowed",
        counterpartyLabel: "Lender",
        counterpartyPlaceholder: "e.g. Ram Bahadur, NIC Asia Bank",
        paymentVerb: "Record payment",
    },
    LENT: {
        tab: "Owed to me",
        short: "Lent",
        counterpartyLabel: "Borrower",
        counterpartyPlaceholder: "e.g. Sita",
        paymentVerb: "Record repayment received",
    },
} as const

export type Direction = keyof typeof DIRECTION
