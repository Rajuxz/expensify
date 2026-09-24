-- C1: money as fixed-point. Existing values are rounded to 2 decimals.
ALTER TABLE "Expenses"
    ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING round("amount"::numeric, 2);

-- C2: per-user timezone for server-side calendar ranges (null = not set yet).
ALTER TABLE "Users" ADD COLUMN "timezone" TEXT;

-- Every dashboard/report query filters on these (see docs/SystemDesign.md H1).
CREATE INDEX "Expenses_userId_isDeleted_expense_date_idx"
    ON "Expenses"("userId", "isDeleted", "expense_date");
