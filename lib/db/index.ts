import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { logger } from "../logger";
import * as schema from "./schema";

type Database = NodePgDatabase<typeof schema>;

type DbGlobal = typeof globalThis & {
  __feedbackCenterDb?: { pool: Pool; db: Database };
};

const globalForDb = globalThis as DbGlobal;

/**
 * The pool is cached on globalThis so Next.js hot reloads and route handlers
 * reuse one pool instead of opening a new one per module instance.
 */
export function getDb(): Database {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env before using the database.");
  }

  if (!globalForDb.__feedbackCenterDb) {
    const pool = new Pool({ connectionString, max: 10 });
    pool.on("error", (error) => {
      logger.error("db.pool.error", { message: "Unexpected Postgres pool error", error });
    });
    globalForDb.__feedbackCenterDb = { pool, db: drizzle(pool, { schema }) };
  }

  return globalForDb.__feedbackCenterDb.db;
}
