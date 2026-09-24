# System Design Review

A review of the architecture of Expensify as of 2026-09-23: what is structurally
wrong or fragile, how serious it is, and how to fix it. Line-level bugs live in
[`Bugs.md`](./Bugs.md); this document is about design.

> Status of `Bugs.md`: items 1–4 (cross-user edit/delete, custom-range and weekly
> reports) and 5 (Float money, see C1) are fixed in code. Item 6 (lint) is still
> open and reappears below as C3.

## Architecture at a glance

| Layer          | Choice                                                                             |
| -------------- | ---------------------------------------------------------------------------------- |
| Framework      | Next.js 16 App Router, React 19, Server Components + Server Actions                |
| Auth           | Clerk; app user row created lazily in `requireUser()` on first request              |
| Data           | PostgreSQL (Supabase pooler) via Prisma 7 + `@prisma/adapter-pg`                   |
| Client data    | SWR, often calling Server Actions as fetchers                                      |
| UI             | shadcn/ui on Base UI, Tailwind 4, TanStack Table                                   |
| Access control | `Roles` enum (USER / ADMIN / SUPER_ADMIN), `SUPER_ADMIN_EMAILS` for permanent owners |
| Debts          | Interest derived on read from principal, rate, start date and payments             |

## Severity scale

| Level        | Meaning                                                                          |
| ------------ | -------------------------------------------------------------------------------- |
| **Critical** | Produces wrong financial numbers, or leaves security-sensitive actions unaccountable |
| **High**     | Will break or degrade noticeably as users/data grow, or leaves data inconsistent  |
| **Medium**   | Maintainability, operability or security hardening gaps                           |
| **Normal**   | Consistency, cleanup and polish                                                   |

## Summary

| #   | Problem                                                      | Severity | Effort   |
| --- | ------------------------------------------------------------ | -------- | -------- |
| C1  | ~~Expense amounts stored as `Float`~~ — **fixed**            | Critical | Medium   |
| C2  | ~~Date boundaries in the server's timezone~~ — **fixed**     | Critical | Medium   |
| C3  | No CI; lint cannot run; migrations are unverified            | Critical | Small    |
| C4  | No audit trail for admin role / email / password changes     | Critical | Small    |
| H1  | ~~No indexes on `Expenses`~~ — **fixed**                     | High     | Small    |
| H2  | Reads go through Server Actions (serialised, uncacheable)    | High     | Medium   |
| H3  | `requireUser()` repeats DB lookups many times per request    | High     | Small    |
| H4  | Unbounded lists: every expense / user loaded into the browser | High     | Medium   |
| H5  | App users only sync with Clerk lazily                        | High     | Medium   |
| H6  | Clerk + DB writes without consistency guarantees             | High     | Small    |
| M1  | Inconsistent cache invalidation; some mutations don't refresh | Medium   | Small    |
| M2  | Global `categories` cache tag                                | Medium   | Small    |
| M3  | No rate limiting on Server Actions                           | Medium   | Small    |
| M4  | Environment is unvalidated; DB host logged on every boot     | Medium   | Small    |
| M5  | No error monitoring or structured logging                    | Medium   | Small    |
| M6  | `"use server"` modules expose internal helpers as endpoints  | Medium   | Small    |
| M7  | Soft delete without restore or retention                     | Medium   | Small    |
| N1  | Placeholder features shipped as real UI                      | Normal   | Varies   |
| N2  | Two definitions of "this week"                               | Normal   | Small    |
| N3  | Mixed conventions and dead code                              | Normal   | Small    |
| N4  | Currency hard-coded as "Rs." across the UI                   | Normal   | Small    |

---

## Critical

### C1. Expense amounts stored as `Float`

> **Fixed (2026-09-23).** `Expenses.amount` is `DECIMAL(12,2)` (migration `20260923180000_decimal_amounts_and_timezone`, existing values rounded). Server code converts with `decimalToNumber()`; totals are summed in Postgres or in paisa via `sumAmounts()` (`lib/money.ts`, covered by `money.check.ts`).

**Where:** `prisma/schema.prisma` → `Expenses.amount Float`; every `_sum` / `reduce` over it.

**Problem:** Binary floating point cannot represent most decimal amounts exactly
(`0.1 + 0.2 !== 0.3`). Sums across many expenses drift, and reports, PDFs and
dashboard totals can disagree by a paisa or more. The newer debts tables already
use `Decimal(12,2)`, so the schema is now inconsistent.

**Solution approach**
1. Migrate `amount` to `Decimal(12,2)` (`ALTER COLUMN ... TYPE DECIMAL(12,2) USING round(amount::numeric, 2)`).
2. Convert at the boundary only: server code works with `Prisma.Decimal` or integer paisa
   (see `lib/debts/money.ts`) and sends plain numbers to the UI.
3. Replace JS `reduce` totals with DB aggregates where possible.
4. Add a check that sums of known values stay exact.

### C2. Date boundaries computed in the server's timezone

> **Fixed (2026-09-23).** `Users.timezone` (auto-detected from the browser on first visit, editable in Settings, default `Asia/Kathmandu`). All server-side periods come from `lib/dates/ranges.ts` (half-open ranges, `@date-fns/tz`, covered by `ranges.check.ts`). Stats moved to `actions/expense/stats.ts` and take no dates from callers; report rows and debt posting dates are formatted/computed in the user's zone.

**Where:** `actions/expense/index.ts` (`getDailyExpense`, `getMonthlyExpense`,
`getYearlyExpense`, `getCashVsOnlineSplit` defaults, `getReportStats`),
`actions/reports/index.ts` (`getDailyReportData`, monthly/yearly), and the
`toLocaleDateString()` / `toLocaleTimeString()` calls in report rows.

**Problem:** These call `new Date()` and `setHours(0,0,0,0)` **on the server**.
When the server runs in UTC (Vercel, most hosts) and the user is in Nepal
(UTC+5:45), "today", "this month" and the times printed in PDFs are shifted.
An expense entered at 00:30 in Nepal lands in the previous day's total. The
custom reports were already fixed by computing boundaries on the client; the
rest of the app still has the bug.

**Solution approach**
1. Pick one rule: **the client decides the calendar range**.
   - Either pass `{ from, to }` instants from the browser (pattern already used in
     `lib/reports/pdf-export-config.ts`),
   - or store a `timezone` on `Users` (default `Asia/Kathmandu`) and compute ranges
     server-side with a timezone-aware helper (`date-fns-tz`).
2. Put that in one helper module, e.g. `lib/dates/ranges.ts`
   (`dayRange`, `weekRange`, `monthRange`, `yearRange`), and remove ad-hoc `setHours` calls.
3. Send raw ISO timestamps to the client and format there, never with server locale.

### C3. No CI; lint cannot run; migrations are unverified

**Where:** no `.github/workflows`; `eslint.config.mjs` imports packages that aren't
installed; recent migrations (`add_user_roles`, `add_debts`) were hand-written.

**Problem:** Nothing stops a type error, a broken migration, or a regression in the
interest math from reaching production. The `*.check.ts` self-checks exist but
nothing runs them.

**Solution approach:** one GitHub Actions workflow on every PR:
1. `pnpm install --frozen-lockfile`
2. `pnpm prisma validate` and `prisma migrate diff` against a throwaway Postgres
   service to prove migrations match `schema.prisma`
3. `pnpm tsc --noEmit`
4. `pnpm lint`, after adding the missing ESLint packages to `devDependencies`
5. Run every `**/*.check.ts` with `tsx`, then migrate to Vitest when the count grows.

### C4. No audit trail for admin role / email / password changes

**Where:** `actions/admin/roles.ts`, `actions/admin/credentials.ts`.

**Problem:** A super admin can grant super admin, or change another person's login
email and password, and **nothing records who did it**. If an admin account is
compromised, or a change is disputed, there is no way to reconstruct what
happened.

**Solution approach**
1. Add an `AdminAuditLog` table: `actorId`, `targetUserId`, `action` (enum:
   `ROLE_CHANGED`, `EMAIL_CHANGED`, `PASSWORD_RESET`), `details` (JSON, **never the
   password**), `created_at`.
2. Write the log row in the same action, after the change succeeds.
3. Show it read-only in the admin panel (super admins only).
4. Optionally email the affected user when their email or password is changed.

---

## High

### H1. No indexes on `Expenses`

> **Fixed (2026-09-23)** in the same migration: `@@index([userId, isDeleted, expense_date])`.

**Where:** `prisma/schema.prisma` → model `Expenses` has no `@@index`.

**Problem:** Nearly every query filters by `userId`, `isDeleted` and a
`expense_date` range (dashboard, reports, transactions). Without an index,
Postgres scans the whole table, which gets slower for every user as the table grows.

**Solution approach:** add `@@index([userId, isDeleted, expense_date])`. Consider
`@@index([userId, categoryId])` for the category breakdown. Verify with
`EXPLAIN ANALYZE` on the dashboard queries.

### H2. Reads go through Server Actions (serialised, uncacheable)

**Where:** `useSWR` with Server Action fetchers in `dashboard-charts.tsx`,
`expense-report.tsx`, `use-report-stats.ts`, `use-period-stat.ts`,
`data-table.tsx`, `manage-category.tsx`, `use-create-category.ts`.

**Problem:** Server Actions are designed for mutations. They are POST requests,
aren't cached by the browser or CDN, and **Next.js runs them one at a time per
client**. A page with four SWR widgets loads them in sequence, and a pending
read delays the user's next save. (Source: Next 16 docs,
`01-app/01-getting-started/07-mutating-data.md`: "The client currently
dispatches and awaits them one at a time… If you need parallel data fetching,
use data fetching in Server Components… or Route Handler".)

**Solution approach**
1. Default: fetch in **Server Components** and pass data as props. Most of these
   pages already do this for their initial data (`fallbackData`).
2. Where the client really needs to refetch, use a GET **Route Handler**
   (`app/api/.../route.ts`) with SWR, or `router.refresh()`.
3. Keep Server Actions for writes only.

### H3. `requireUser()` repeats DB lookups many times per request

**Where:** `lib/auth/getCurrentUser.ts`, called about 31 times across actions.
The dashboard layout and page alone trigger about 7 identical `findUnique` queries
per render.

**Problem:** Wasted database round trips on every page, and a Clerk API call
whenever the email backfill path runs.

**Solution approach:** move the lookup into a plain server module (not
`"use server"`), wrap it in React `cache()` so it runs once per request, and have
actions call that. See also M6.

### H4. Unbounded lists: every expense / user loaded into the browser

**Where:** `getExpenses()` (transactions page), `getAdminUsers()` (admin panel).
Filtering, search and pagination all happen client-side.

**Problem:** Payload size, render time and memory grow with the number of rows. A user with a
few thousand expenses downloads all of them on every visit.

**Solution approach**
1. Move filters (period, payment type, uncategorized, search) and pagination into the
   query, driven by URL `searchParams` so views are shareable and survive refresh.
2. Use cursor pagination on `(expense_date, id)`.
3. Compute totals with `aggregate` in the same request rather than summing rows in the browser.
4. Bulk actions ("select all matching") then operate on a server-side filter, not
   a list of ids.

### H5. App users only sync with Clerk lazily

**Where:** `requireUser()` creates the `Users` row on first request; there is no
webhook, although `svix` is already installed.

**Problem**
- **Missing users:** people who signed up but never opened the app don't exist in the DB,
  so admins can't see or promote them.
- **Stale deletions:** users deleted in Clerk stay in the DB forever.
- **Stale identity:** email and username changes made in Clerk's profile never reach
  `Users.email`, and `SUPER_ADMIN_EMAILS` matching depends on that column.

**Solution approach:** add `app/api/webhooks/clerk/route.ts`, verified with
`svix`, handling `user.created`, `user.updated` and `user.deleted`, and upsert or
soft-delete the `Users` row. Keep the lazy creation as a fallback.

### H6. Clerk + DB writes without consistency guarantees

**Where:** `actions/admin/credentials.ts` → `updateUserEmail` updates Clerk, then the DB.

**Problem:** If the DB update fails after Clerk succeeded, the admin list and
super-admin matching show the old email. There's no retry or reconciliation.

**Solution approach:** treat Clerk as the source of truth and let the H5 webhook
write `Users.email`. The action then only calls Clerk, and a failed or retried webhook
fixes itself.

---

## Medium

### M1. Inconsistent cache invalidation; some mutations don't refresh

**Where:** Actions mix `refresh()`, `revalidatePath()`, `revalidateTag()`,
`updateTag()` and client `mutate()`. `updateExpenses` and `softDeleteExpense` call
none of them, so edited or deleted rows stay on screen until reload.

**Solution approach:** one documented convention:
- Server-rendered pages: `revalidatePath()` for the affected route, or `refresh()`.
- Cached data (`categories`): tag-based.
- Client SWR caches: update from the action's return value.

Then fix the two actions that currently do nothing.

### M2. Global `categories` cache tag

**Where:** `actions/category/index.ts` → `unstable_cache(..., { tags: ["categories"] })`.

**Problem:** Every create, rename or delete by *any* user invalidates *every* user's
cached categories.

**Solution approach:** tag per user (`categories:${userId}`) and invalidate only
that tag. Check the Next 16 docs in `node_modules/next/dist/docs` for the current
recommended caching API before changing it.

### M3. No rate limiting on Server Actions

**Where:** all actions, most importantly `actions/admin/credentials.ts`, `createCategory`
and the bulk actions.

**Problem:** Actions are public POST endpoints. A script can spam category creation
or password resets.

**Solution approach:** a small `rateLimit(key, limit, window)` helper (e.g. Upstash
Redis, or a Postgres table) applied per user id, strictest on admin actions.

### M4. Environment is unvalidated; DB host logged on every boot

**Where:** `lib/prisma.ts` (`console.log("🔍 DB host in use: ...")`), env read ad
hoc via `process.env`.

**Problem:** A missing or typo'd variable fails deep inside a request instead of
at startup. Logging infrastructure details on every cold start is noise and leaks
information.

**Solution approach:** `lib/env.ts` parses `process.env` with zod once
(`DATABASE_URL`, `CLERK_SECRET_KEY`, `SUPER_ADMIN_EMAILS`, …) and exports a typed
object. Remove the host log.

### M5. No error monitoring or structured logging

**Problem:** Errors go to `console.error` only. Production failures such as Clerk API errors,
PDF generation or migration drift are invisible until a user complains.

**Solution approach:** Sentry via `@sentry/nextjs` using Next 16's
`instrumentation.ts` / `instrumentation-client.ts` hooks, `global-error.tsx`, and
the user id as context (no emails or financial data).

### M6. `"use server"` modules expose internal helpers as endpoints

**Where:** `lib/auth/getCurrentUser.ts` is a `"use server"` file, so `requireUser`
is itself a callable Server Action that returns the full user row (email, role,
`clerk_id`).

**Problem:** Every exported async function in a `"use server"` file becomes a
public endpoint. Today everything checks auth, but that makes endpoints easy to
create by accident.

**Solution approach:** keep `"use server"` only in `actions/**`. Move helpers like
`requireUser` into plain server modules (optionally guarded with the `server-only`
package). Have actions return small DTOs, not raw rows.

### M7. Soft delete without restore or retention

**Where:** `Expenses.isDeleted`; single and bulk delete.

**Problem:** The UI says "cannot be undone", but the data is kept forever and can't
be restored. That's the worst of both: no undo, and no real deletion either.

**Solution approach:** add `deleted_at`, a "Recently deleted" view with restore,
and a scheduled purge after N days. Account deletion (currently a TODO) should
hard-delete.

---

## Normal

### N1. Placeholder features shipped as real UI

- **Budgets:** the page uses hard-coded sample data.
- **Currency preference:** "Coming soon", no persistence.
- **Settings:** "Export Data" and "Delete Account" only log to the console.
- **Reports header:** the "Export" button does nothing.
- **CSV exports:** they show "isn't available yet".

**Approach:** either implement them or hide them behind a flag. Controls that don't
work erode trust in the numbers that do.

### N2. Two definitions of "this week"

The dashboard and report stat cards use a **Sunday** start (`getStartOfWeek`); the
weekly PDF uses **Monday** (`getCurrentWeek`). Pick one, ideally as a user setting,
in the shared date-range helper from C2.

### N3. Mixed conventions and dead code

- **Pages in `app/`:** `budgets/page.tsx` and `settings/page.tsx` are client
  components, against the "no client files in `app/`" rule.
- **Dead files:** `features/reports/components/report-section.tsx` (unused) and
  `custom-report.tsx` (empty).
- **Naming:**
  - Model fields mix `snake_case` and `camelCase` (`expense_date` vs `categoryId`).
  - Helper file names mix camelCase and kebab-case (`getCurrentUser.ts` vs `require-role.ts`).
- **shadcn CLI:** `npx shadcn@latest` adds a stray `cn` package. Use the pinned
  `pnpm shadcn` instead.

### N4. Currency hard-coded as "Rs." across the UI

Formatting is duplicated (`Rs. ${x.toLocaleString()}`, `formatRs`, report PDFs).
Use one `formatMoney()` so the currency preference (N1) becomes a one-line change.

---

## Suggested fix order

1. **C3** CI (so every later fix is verified)
2. **C4** audit log + **H1** indexes (small, high value)
3. **C2** date-range helper, then **C1** Decimal migration (both touch the same queries)
4. **H3 / M6** request-scoped `requireUser`, then **H2** move reads out of Server Actions
5. **H5 / H6** Clerk webhook
6. **H4** server-side pagination for transactions
7. Medium and Normal items as they're touched

---

## Features to add

### Quick (days, no new infrastructure)

| Feature                        | Why / builds on                                                         |
| ------------------------------ | ----------------------------------------------------------------------- |
| CSV export for all reports     | Report rows are already uniform; one generic serializer                  |
| Export all data (CSV/JSON)     | Replaces the Settings TODO; also a trust feature                         |
| Recently deleted + restore     | Fixes M7; `isDeleted` already exists                                     |
| Category colors + chart        | `Categories.color` exists unused; `recharts` installed                   |
| Transactions search + sorting  | TanStack sorting / global filter                                         |
| Admin audit log view           | Pairs with C4                                                            |
| Debt due dates & overdue badge | Optional `due_day` on `Debts`; the calculator already knows posting dates |

### Medium (a new table or an external service)

| Feature                                | Notes                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------ |
| Real budgets with 80% / 100% alerts    | `Budgets` table (user, category or null, month, limit); replaces mock page |
| Income and net balance                 | Transaction kind `INCOME`; reports show net                              |
| Recurring expenses                     | Rule table plus a scheduled job (Vercel Cron) that creates expenses       |
| Email notifications                    | Budget alerts, debt interest reminders, admin credential-change notices (Resend) |
| Currency preference                    | User setting plus `formatMoney()` (N4)                                   |
| Bikram Sambat dates                    | Display-layer conversion; strong fit for the Nepali audience             |
| More payment methods                   | eSewa, Khalti, card: enum migration plus filters                         |
| Receipt attachments                    | Object storage (S3 / UploadThing) plus a column on `Expenses`             |
| CSV import                             | Bring in bank statements or old spreadsheets with column mapping          |

### Larger (product direction)

| Feature                           | Notes                                                              |
| --------------------------------- | ------------------------------------------------------------------ |
| Shared expenses / bill splitting  | Builds on the Debts module (who owes whom)                          |
| AI category suggestions           | Suggest from title + history; the inline-create flow already exists |
| Receipt OCR                       | Photo to prefilled expense                                          |
| Natural-language entry            | "500 momo yesterday cash" to an expense                             |
| Installable PWA with offline entry | Queue writes offline, sync later                                    |
| Household accounts                | Shared budgets and roles, building on the role system               |
| Forecasting                       | "At this pace you'll spend Rs. X this month"; savings goals         |
