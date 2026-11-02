import { defineConfig } from "drizzle-kit";
import { databaseUrlFromEnv, missingDatabaseUrlMessage } from "./lib/db/url";

try {
  process.loadEnvFile(".env");
} catch {
  // The environment may already come from the shell or CI.
}

const url = databaseUrlFromEnv();
if (!url) throw new Error(missingDatabaseUrlMessage());

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
