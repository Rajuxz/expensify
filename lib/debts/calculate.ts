// Debt math: simple monthly interest on the outstanding principal.
// Pure functions (no DB, no React) so they're shared by server and client
// and covered by calculate.check.ts.
//
// Rules
// - Interest is posted once a month, on each monthly anniversary of the
//   start date (Jan 15 -> Feb 15 -> Mar 15 ...).
// - Within a month it accrues day by day on the principal outstanding at
//   the time, so paying principal mid-month lowers that month's interest.
// - It is simple interest: unpaid interest is tracked separately and never
//   earns interest itself.
// - A payment first brings interest up to its date, then pays unpaid
//   interest, then principal. So paying `payoffToday` settles exactly.
import { addMonths } from "date-fns"
import { addMonthsInZone } from "@/lib/dates/ranges"
import { toPaisa, toRupees } from "./money"

export type DebtInput = {
    principal: number // rupees
    monthlyRate: number // percent per month, e.g. 2 = 2%
    startDate: Date
    payments: { amount: number; paidOn: Date }[] // rupees
    // user's IANA timezone; "same day each month" is decided in it
    // (matters for month-end start dates). Omitted = runtime's zone.
    timeZone?: string
}

export type TimelineEntry = {
    kind: "interest" | "payment"
    date: Date
    amount: number // rupees: interest posted, or payment made
    toInterest: number // payment only: part that paid interest
    toPrincipal: number // payment only: part that paid principal
    principalAfter: number
    interestDueAfter: number
}

export type DebtState = {
    principalOutstanding: number
    interestDue: number // posted and unpaid
    accruedThisMonth: number // accrued since last posting, not yet posted
    payoffToday: number // everything needed to close the debt today
    totalPaid: number
    totalInterestCharged: number // posted so far
    nextPostingDate: Date | null // null once settled
    nextMonthInterest: number // estimate for the next full month
    isSettled: boolean
    overpaid: number // > 0 means payments exceed what was owed
    timeline: TimelineEntry[]
}

const MAX_MONTHS = 1200 // 100 years; guards against bad start dates

export function calculateDebt(input: DebtInput, asOf = new Date()): DebtState {
    const rate = input.monthlyRate / 100
    // the k-th monthly anniversary of the start date
    const nthMonth = (k: number) =>
        input.timeZone
            ? addMonthsInZone(input.startDate, k, input.timeZone)
            : addMonths(input.startDate, k)
    const payments = [...input.payments]
        .filter((p) => p.paidOn <= asOf)
        .sort((a, b) => a.paidOn.getTime() - b.paidOn.getTime())

    let principal = toPaisa(input.principal)
    let interestDue = 0 // paisa, posted and unpaid
    let pending = 0 // fractional paisa accrued in the current month
    let totalPaid = 0
    let totalInterest = 0
    let overpaid = 0
    const timeline: TimelineEntry[] = []

    let month = 1
    let periodStart = input.startDate
    let lastEvent = input.startDate // accrual has been counted up to here
    let i = 0

    // accrue interest on the current principal from lastEvent to `until`
    const accrueTo = (until: Date) => {
        const periodEnd = nthMonth(month)
        const periodLength = periodEnd.getTime() - periodStart.getTime()
        const elapsed = until.getTime() - lastEvent.getTime()
        if (elapsed > 0 && periodLength > 0) {
            pending += principal * rate * (elapsed / periodLength)
        }
        lastEvent = until
    }

    while (month <= MAX_MONTHS) {
        const postingDate = nthMonth(month)
        const payment = payments[i]

        if (payment && payment.paidOn < postingDate) {
            // a payment before this month's anniversary: first bring
            // interest up to the payment date, so the payment covers
            // interest-to-date before touching principal
            accrueTo(payment.paidOn)
            const toDate = Math.round(pending)
            pending = 0
            if (toDate > 0) {
                interestDue += toDate
                totalInterest += toDate
                timeline.push({
                    kind: "interest",
                    date: payment.paidOn,
                    amount: toRupees(toDate),
                    toInterest: 0,
                    toPrincipal: 0,
                    principalAfter: toRupees(principal),
                    interestDueAfter: toRupees(interestDue),
                })
            }

            let amount = toPaisa(payment.amount)
            const toInterest = Math.min(amount, interestDue)
            interestDue -= toInterest
            amount -= toInterest
            const toPrincipal = Math.min(amount, principal)
            principal -= toPrincipal
            overpaid += amount - toPrincipal
            totalPaid += toPaisa(payment.amount)
            timeline.push({
                kind: "payment",
                date: payment.paidOn,
                amount: payment.amount,
                toInterest: toRupees(toInterest),
                toPrincipal: toRupees(toPrincipal),
                principalAfter: toRupees(principal),
                interestDueAfter: toRupees(interestDue),
            })
            i++
        } else if (postingDate <= asOf) {
            // month completed: post the accrued interest
            accrueTo(postingDate)
            const posted = Math.round(pending)
            pending = 0
            if (posted > 0) {
                interestDue += posted
                totalInterest += posted
                timeline.push({
                    kind: "interest",
                    date: postingDate,
                    amount: toRupees(posted),
                    toInterest: 0,
                    toPrincipal: 0,
                    principalAfter: toRupees(principal),
                    interestDueAfter: toRupees(interestDue),
                })
            }
            periodStart = postingDate
            month++
            // settled and nothing left to process -> stop walking months
            if (principal === 0 && interestDue === 0 && i >= payments.length)
                break
        } else {
            break
        }
    }

    // interest accrued so far in the month in progress
    if (principal > 0) accrueTo(asOf)
    const accrued = Math.round(pending)
    const isSettled = principal === 0 && interestDue === 0

    return {
        principalOutstanding: toRupees(principal),
        interestDue: toRupees(interestDue),
        accruedThisMonth: toRupees(accrued),
        payoffToday: toRupees(principal + interestDue + accrued),
        totalPaid: toRupees(totalPaid),
        totalInterestCharged: toRupees(totalInterest),
        nextPostingDate: isSettled ? null : nthMonth(month),
        nextMonthInterest: toRupees(Math.round(principal * rate)),
        isSettled,
        overpaid: toRupees(overpaid),
        timeline,
    }
}

/**
 * Smallest equal monthly payment that clears the debt in `months` payments,
 * each made on a posting date. Simulates the exact rules above (simple
 * interest, unpaid interest doesn't earn interest, per-month rounding), so
 * following the plan never leaves a 0.01 leftover.
 */
export function monthlyInstallment(
    principal: number,
    monthlyRate: number,
    months: number,
    unpaidInterest = 0
): number {
    const p0 = toPaisa(principal)
    const u0 = toPaisa(unpaidInterest)
    if (p0 + u0 <= 0 || months < 1) return 0
    const r = monthlyRate / 100

    const clears = (payment: number) => {
        let p = p0
        let u = u0
        for (let m = 0; m < months; m++) {
            u += Math.round(p * r) // month's interest posted
            const toInterest = Math.min(payment, u)
            u -= toInterest
            p = Math.max(0, p - (payment - toInterest))
        }
        return p === 0 && u === 0
    }

    // binary search on whole paisa; `high` (pay everything + a full
    // month's interest each month) always clears
    let low = 0
    let high = p0 + u0 + Math.ceil(p0 * r) * months
    while (low < high) {
        const mid = Math.floor((low + high) / 2)
        if (clears(mid)) high = mid
        else low = mid + 1
    }
    return toRupees(low)
}

/** Interest paid in total when following monthlyInstallment() to the end
 *  (includes any interest that was already unpaid). */
export function totalInterestFor(
    principal: number,
    monthlyRate: number,
    months: number,
    unpaidInterest = 0
): number {
    const perMonth = monthlyInstallment(
        principal,
        monthlyRate,
        months,
        unpaidInterest
    )
    return Math.max(
        0,
        toRupees(toPaisa(perMonth) * months - toPaisa(principal))
    )
}
