-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('EXPENSE_RESTORED', 'EXPENSE_PURGED');

-- CreateTable
CREATE TABLE "AuditLogs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" "AuditAction" NOT NULL,
    "entityId" UUID NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" UUID NOT NULL,

    CONSTRAINT "AuditLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLogs_actorId_created_at_idx" ON "AuditLogs"("actorId", "created_at");

-- AddForeignKey
ALTER TABLE "AuditLogs" ADD CONSTRAINT "AuditLogs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
