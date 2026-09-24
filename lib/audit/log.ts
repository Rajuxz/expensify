// Writes audit entries. Server-side only. Pass the transaction client so the
// log row commits (or rolls back) together with the change it describes.
import type { Prisma } from "@/lib/generated/prisma/client"
import type { AuditAction } from "@/lib/generated/prisma/enums"

type Tx = Prisma.TransactionClient

export type AuditEntry = {
    action: AuditAction
    entityId: string
    // small snapshot for humans; never secrets
    details?: Prisma.InputJsonValue
}

export async function writeAuditLogs(
    tx: Tx,
    actorId: string,
    entries: AuditEntry[]
) {
    if (entries.length === 0) return
    await tx.auditLogs.createMany({
        data: entries.map((e) => ({ ...e, actorId })),
    })
}
