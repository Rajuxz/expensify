# Bug Report

## Severity ranking

Critical issues allow cross-account data mutation. High issues produce incorrect financial reports. Medium issues corrupt precision or block project quality checks. Low issues expose controls that cannot work.

## Critical

### 1. Any authenticated user can edit another user's expense

**Location:** `actions/expense/index.ts` — `updateExpenses`

The action never calls `requireUser()` and updates solely by `expenseId`. A caller can invoke the server action with another expense UUID and replace its amount, date, description, transaction type, and category. It also accepts unvalidated values and does not verify that the replacement category belongs to the expense owner.

**Impact:** Cross-account modification, financial-data corruption, and a possible cross-account category association.

### 2. Any authenticated user can delete another user's expense

**Location:** `actions/expense/index.ts` — `softDeleteExpense`

This action updates solely by `expenseId` without authenticating the owner or constraining the update by `userId`.

**Impact:** An attacker who obtains another expense UUID can hide that expense from its owner. The UI describes this action as irreversible, so the practical data-loss impact is high.

## High

### 3. Custom date-range reports ignore the selected range

**Location:** `lib/reports/pdf-export-config.ts`, `actions/reports/index.ts` — `getWeeklyReport`

The `date-range` export passes `params.from` and `params.to` to `getWeeklyReport`, but `getWeeklyReport(from, to)` discards both arguments and calculates a new range from the current date.

**Impact:** A PDF requested for a chosen 2–15 day range instead contains the current week, making exported financial records incorrect.

### 4. The weekly PDF uses a different week definition and an incorrect boundary

**Location:** `lib/helpers/getCurrentWeek.ts`, `actions/reports/index.ts` — `getWeeklyReport`

`getCurrentWeek` defines Monday through Sunday, while `getWeeklyReport` independently defines Sunday through the following Sunday. The query uses `lte` on a boundary at midnight seven days later, so it includes the prior Sunday and may include an expense exactly at the next Sunday midnight.

**Impact:** The weekly export does not match the period it requests and can misstate both rows and totals.

## Medium

### 5. Currency amounts are stored as floating-point values

**Location:** `prisma/schema.prisma` — `Expenses.amount Float`

Amounts are persisted and summed as binary floating-point numbers. Values such as `0.1` cannot be represented exactly, despite form validation limiting input to two decimal places.

**Impact:** Aggregated balances and exported totals can contain rounding errors. Currency should use a fixed-scale decimal or integer minor units.

### 6. The lint command cannot run from a clean install

**Location:** `eslint.config.mjs`, `package.json`

`eslint.config.mjs` imports `eslint-config-turbo`, `eslint-plugin-prettier`, `eslint-plugin-unused-imports`, `eslint-config-prettier`, and `@typescript-eslint/parser`, but they are not declared dependencies. `pnpm lint` fails immediately with `ERR_MODULE_NOT_FOUND` for `eslint-config-turbo`.

**Impact:** CI and developers cannot run the configured static checks, allowing regressions to bypass the intended quality gate.

### 7. Production builds run database migrations as a build side effect

**Location:** `package.json` — `build`

The build script runs `prisma migrate deploy` before `next build`. Build systems commonly run builds concurrently, repeatedly, or against preview environments; migrations are a deployment operation, not a compilation prerequisite.

**Impact:** Builds require production-database connectivity and can fail or race during deployment, turning a source build into a schema-changing operation.

## Low

### 8. CSV export controls always fail

**Location:** `features/reports/components/export-buttons.tsx`, `features/reports/components/custom-report-section.tsx`, `hooks/use-report-export.ts`

The UI renders enabled CSV buttons, but `handleExport` immediately rejects every non-PDF request with “This report type isn't available yet.”

**Impact:** Users are offered an export format that cannot succeed.

## Verification performed

- TypeScript: `node_modules\\.bin\\tsc.cmd --noEmit` completed successfully.
- Lint: `pnpm.cmd lint` fails as described above.
- Findings were traced from each client control through its server action and Prisma query.
