// Runnable self-check for debt math: `npx tsx lib/debts/calculate.check.ts`
import assert from "node:assert/strict"
import { calculateDebt, monthlyInstallment } from "./calculate"

const d = (s: string) => new Date(`${s}T00:00:00`)

// 1. no payments: 3 full months at 2% of 100,000 = 6,000 interest
{
    const s = calculateDebt(
        {
            principal: 100000,
            monthlyRate: 2,
            startDate: d("2026-01-01"),
            payments: [],
        },
        d("2026-04-01")
    )
    assert.equal(s.interestDue, 6000)
    assert.equal(s.principalOutstanding, 100000)
    assert.equal(s.accruedThisMonth, 0)
    assert.equal(s.payoffToday, 106000)
    assert.equal(s.nextPostingDate?.getMonth(), 4) // May
    assert.equal(s.nextMonthInterest, 2000)
}

// 2. simple, not compound: unpaid interest never earns interest
{
    const s = calculateDebt(
        {
            principal: 100000,
            monthlyRate: 2,
            startDate: d("2026-01-01"),
            payments: [],
        },
        d("2027-01-01")
    )
    assert.equal(s.interestDue, 24000) // 12 x 2,000, not 1.02^12
}

// 3. payment on the posting date clears that month's interest first
{
    const s = calculateDebt(
        {
            principal: 100000,
            monthlyRate: 2,
            startDate: d("2026-01-01"),
            payments: [{ amount: 2000, paidOn: d("2026-02-01") }],
        },
        d("2026-03-01")
    )
    assert.equal(s.principalOutstanding, 100000)
    assert.equal(s.interestDue, 2000) // only March's posting remains
    assert.equal(s.timeline[1].toInterest, 2000)
}

// 4. mid-month payment: pays interest-to-date first, then principal;
//    the rest of the month accrues on the lower principal
{
    const s = calculateDebt(
        {
            principal: 100000,
            monthlyRate: 2,
            startDate: d("2026-01-01"),
            payments: [{ amount: 50000, paidOn: d("2026-01-16") }],
        },
        d("2026-02-01")
    )
    const days = 31
    const toDate = Math.round(100000 * 0.02 * (15 / days) * 100) / 100 // 967.74
    const principalLeft = 100000 - (50000 - toDate)
    const rest = Math.round(principalLeft * 0.02 * (16 / days) * 100) / 100
    assert.equal(s.principalOutstanding, principalLeft)
    assert.equal(s.interestDue, rest)
    assert.equal(
        s.totalInterestCharged,
        Math.round((toDate + rest) * 100) / 100
    )
}

// 4b. paying exactly `payoffToday` mid-month settles the debt
{
    const base = {
        principal: 100000,
        monthlyRate: 2,
        startDate: d("2026-01-01"),
        payments: [] as { amount: number; paidOn: Date }[],
    }
    const today = d("2026-03-20")
    const { payoffToday } = calculateDebt(base, today)
    const s = calculateDebt(
        { ...base, payments: [{ amount: payoffToday, paidOn: today }] },
        today
    )
    assert.equal(s.isSettled, true)
    assert.equal(s.overpaid, 0)
}

// 5. interest-free loan
{
    const s = calculateDebt(
        {
            principal: 5000,
            monthlyRate: 0,
            startDate: d("2026-01-01"),
            payments: [],
        },
        d("2026-09-01")
    )
    assert.equal(s.interestDue, 0)
    assert.equal(s.payoffToday, 5000)
}

// 6. overpayment is reported, debt is settled
{
    const s = calculateDebt(
        {
            principal: 1000,
            monthlyRate: 0,
            startDate: d("2026-01-01"),
            payments: [{ amount: 1500, paidOn: d("2026-01-10") }],
        },
        d("2026-03-01")
    )
    assert.equal(s.isSettled, true)
    assert.equal(s.overpaid, 500)
    assert.equal(s.nextPostingDate, null)
}

// 7. following the installment plan clears the debt exactly on time
{
    const perMonth = monthlyInstallment(100000, 2, 12)
    assert.ok(perMonth >= 9455.96 && perMonth < 9456.1, `${perMonth}`)
    const payments = Array.from({ length: 12 }, (_, k) => ({
        amount: perMonth,
        paidOn: new Date(2026, 1 + k, 1),
    }))
    const s = calculateDebt(
        {
            principal: 100000,
            monthlyRate: 2,
            startDate: d("2026-01-01"),
            payments,
        },
        d("2027-02-15")
    )
    assert.equal(s.isSettled, true)
    assert.ok(s.overpaid < 1, `rounding leftover too big: ${s.overpaid}`)
}

// 8. zero-rate installment and month-end start dates don't break
assert.equal(monthlyInstallment(1200, 0, 12), 100)
calculateDebt(
    {
        principal: 1000,
        monthlyRate: 1,
        startDate: d("2026-01-31"),
        payments: [],
    },
    d("2026-06-01")
)

console.log("calculate.check: all passed")

// 9. installment with unpaid interest: following the plan settles exactly
{
    const start = d("2026-01-01")
    const asOf = d("2026-04-01") // 3 months unpaid -> 6,000 interest due
    const base = { principal: 100000, monthlyRate: 2, startDate: start }
    const now = calculateDebt({ ...base, payments: [] }, asOf)
    const perMonth = monthlyInstallment(
        now.principalOutstanding,
        2,
        6,
        now.interestDue
    )
    const payments = Array.from({ length: 6 }, (_, k) => ({
        amount: perMonth,
        paidOn: new Date(2026, 4 + k, 1), // May 1 .. Oct 1
    }))
    const after = calculateDebt({ ...base, payments }, d("2026-10-15"))
    assert.equal(after.isSettled, true, JSON.stringify(after.timeline.at(-1)))
    assert.ok(after.overpaid < 0.06, `leftover ${after.overpaid}`)
}
console.log("calculate.check (installments): all passed")

// 10. timezone: a loan started Jan 31 (Nepal) posts on Feb 28 Nepal time,
//     regardless of the machine's own timezone
{
    const jan31Npt = new Date("2026-01-30T18:15:00Z")
    const s = calculateDebt(
        {
            principal: 1000,
            monthlyRate: 1,
            startDate: jan31Npt,
            payments: [],
            timeZone: "Asia/Kathmandu",
        },
        new Date("2026-02-15T00:00:00Z")
    )
    assert.equal(s.nextPostingDate?.toISOString(), "2026-02-27T18:15:00.000Z")
}
console.log("calculate.check (timezone): all passed")
