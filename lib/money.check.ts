// Runnable self-check: `npx tsx lib/money.check.ts`
import assert from "node:assert/strict"
import { decimalToNumber, sumAmounts, toPaisa } from "./money"

// the C1 bug: float addition drifts, paisa addition doesn't
assert.notEqual(0.1 + 0.2, 0.3)
assert.equal(sumAmounts([0.1, 0.2]), 0.3)
assert.equal(sumAmounts(Array(1000).fill(0.01)), 10)
assert.equal(sumAmounts([19.99, 5.01, 75]), 100)
assert.equal(sumAmounts([]), 0)

// 2-decimal inputs whose float x100 lands just below the integer
assert.equal(0.29 * 100 === 29, false)
assert.equal(toPaisa(0.29), 29)
assert.equal(toPaisa(1.15), 115)
assert.equal(decimalToNumber(null), 0)
assert.equal(decimalToNumber(12.5), 12.5)
assert.equal(decimalToNumber({ toNumber: () => 99.99 }), 99.99)

console.log("money.check: all passed")
