const CONNECTION_URL_NAMES = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
] as const;

/**
 * Managed Postgres integrations on Vercel, such as Vercel Postgres and
 * Supabase, inject the connection string under their own names. DATABASE_URL
 * stays the explicit override; the provider values keep a connected database
 * working without duplicating the secret by hand.
 */
export function databaseUrlFromEnv(env: NodeJS.ProcessEnv = process.env): string | undefined {
  for (const name of CONNECTION_URL_NAMES) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function missingDatabaseUrlMessage(): string {
  return `Database connection is not configured. Set ${CONNECTION_URL_NAMES.join(", ")} in the environment (Vercel Project Settings, Production and Preview) and redeploy.`;
}
