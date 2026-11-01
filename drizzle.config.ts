import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env");
} catch {
  // The environment may already come from the shell or CI.
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL?.trim() ?? "" },
  strict: true,
  verbose: true,
});
