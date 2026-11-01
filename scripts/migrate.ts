/**
 * Applies Drizzle migrations to the database in DATABASE_URL.
 *
 * Runs from `npm run deploy` and locally with `npm run migrate`. Never at
 * application startup.
 */
import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getDb } from "../lib/db";

try {
  process.loadEnvFile(".env");
} catch {
  // The environment may already come from the shell or CI.
}

async function main(): Promise<void> {
  await migrate(getDb(), { migrationsFolder: path.join(process.cwd(), "drizzle") });
  console.log("Migrations applied.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
