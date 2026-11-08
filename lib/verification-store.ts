import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "./db";
import { verifications, type VerificationRow } from "./db/schema";

export type VerificationIdentifier = { phone: string } | { email: string };

export async function createVerification(
  identifier: VerificationIdentifier,
  codeHash: string,
  expiresAt: Date,
): Promise<string> {
  return getDb().transaction(async (tx) => {
    if ("phone" in identifier) {
      await tx
        .delete(verifications)
        .where(and(eq(verifications.phone, identifier.phone), isNull(verifications.consumedAt)));
    } else {
      await tx
        .delete(verifications)
        .where(and(eq(verifications.email, identifier.email), isNull(verifications.consumedAt)));
    }

    const [row] = await tx
      .insert(verifications)
      .values({ ...identifier, codeHash, expiresAt })
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

export function verificationIdentifier(row: VerificationRow): VerificationIdentifier {
  if (row.phone) return { phone: row.phone };
  if (row.email) return { email: row.email };
  throw new Error("Verification has no identifier");
}

export async function incrementAttempts(id: string): Promise<number> {
  const [row] = await getDb()
    .update(verifications)
    .set({ attempts: sql`${verifications.attempts} + 1` })
    .where(eq(verifications.id, id))
    .returning({ attempts: verifications.attempts });
  return row?.attempts ?? 0;
}

export async function consumeVerification(
  id: string,
  identifier: VerificationIdentifier,
): Promise<boolean> {
  const match =
    "phone" in identifier ? eq(verifications.phone, identifier.phone) : eq(verifications.email, identifier.email);
  const [row] = await getDb()
    .update(verifications)
    .set({ consumedAt: new Date() })
    .where(and(eq(verifications.id, id), match, isNull(verifications.consumedAt)))
    .returning({ id: verifications.id });
  return Boolean(row);
}
