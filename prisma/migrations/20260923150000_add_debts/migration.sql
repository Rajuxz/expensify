-- CreateEnum
CREATE TYPE "DebtDirection" AS ENUM ('BORROWED', 'LENT');

-- CreateTable
CREATE TABLE "Debts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "direction" "DebtDirection" NOT NULL,
    "counterparty" TEXT NOT NULL,
    "principal" DECIMAL(12,2) NOT NULL,
    "monthly_rate" DECIMAL(5,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "userId" UUID NOT NULL,

    CONSTRAINT "Debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtPayments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "amount" DECIMAL(12,2) NOT NULL,
    "paid_on" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "debtId" UUID NOT NULL,

    CONSTRAINT "DebtPayments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Debts_userId_idx" ON "Debts"("userId");

-- CreateIndex
CREATE INDEX "DebtPayments_debtId_idx" ON "DebtPayments"("debtId");

-- AddForeignKey
ALTER TABLE "Debts" ADD CONSTRAINT "Debts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtPayments" ADD CONSTRAINT "DebtPayments_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
