import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "./db";
import { verifications, type VerificationRow } from "./db/schema";

export async function createVerification(
  phone: string,
  codeHash: string,
  expiresAt: Date,
): Promise<string> {
  return getDb().transaction(async (tx) => {
    await tx
      .delete(verifications)
      .where(and(eq(verifications.phone, phone), isNull(verifications.consumedAt)));

    const [row] = await tx
      .insert(verifications)
      .values({ phone, codeHash, expiresAt })
      .returning({ id: verifications.id });

    if (!row) {
      throw new Error("Could not create the verification");
    }
    return row.id;
  });
}

export async function deleteVerification(id: string): Promise<void> {
  await getDb().delete(verifications).where(eq(verifications.id, id));
}

export async function getVerification(id: string): Promise<VerificationRow | null> {
  const [row] = await getDb().select().from(verifications).where(eq(verifications.id, id)).limit(1);
  return row ?? null;
}

export async function incrementAttempts(id: string): Promise<number> {
  const [row] = await getDb()
    .update(verifications)
    .set({ attempts: sql`${verifications.attempts} + 1` })
    .where(eq(verifications.id, id))
    .returning({ attempts: verifications.attempts });
  return row?.attempts ?? 0;
}

export async function consumeVerification(id: string, phone: string): Promise<boolean> {
  const [row] = await getDb()
    .update(verifications)
    .set({ consumedAt: new Date() })
    .where(
      and(
        eq(verifications.id, id),
        eq(verifications.phone, phone),
        isNull(verifications.consumedAt),
      ),
    )
    .returning({ id: verifications.id });
  return Boolean(row);
}
