import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import { logger } from "../logger";
import * as schema from "./schema";
import { SUPABASE_CA } from "./supabase-ca";
import { databaseUrlFromEnv, missingDatabaseUrlMessage } from "./url";

type Database = NodePgDatabase<typeof schema>;

type DbGlobal = typeof globalThis & {
  __feedbackCenterDb?: { pool: Pool; db: Database };
};

const globalForDb = globalThis as DbGlobal;

const SUPABASE_SSL_PARAMS = ["sslmode", "sslrootcert", "sslcert", "sslkey", "sslpassword"];

function poolConfig(connectionString: string): PoolConfig {
  const url = new URL(connectionString);
  const host = url.hostname.toLowerCase();
  const isSupabase = host.endsWith(".supabase.co") || host.endsWith(".supabase.com");
  if (!isSupabase) return { connectionString, max: 10 };

  for (const name of SUPABASE_SSL_PARAMS) url.searchParams.delete(name);
  // The Supavisor session pooler caps clients at pool_size (15). Dev keeps more
  // than one module realm, each with its own pool, so stay well under that.
  return {
    connectionString: url.toString(),
    ssl: { ca: SUPABASE_CA },
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  };
}

/**
 * The pool is cached on globalThis so Next.js hot reloads and route handlers
 * reuse one pool instead of opening a new one per module instance.
 */
export function getDb(): Database {
  const connectionString = databaseUrlFromEnv();
  if (!connectionString) {
    throw new Error(missingDatabaseUrlMessage());
  }

  if (!globalForDb.__feedbackCenterDb) {
    const pool = new Pool(poolConfig(connectionString));
    pool.on("error", (error) => {
      logger.error("db.pool.error", { message: "Unexpected Postgres pool error", error });
    });
    globalForDb.__feedbackCenterDb = { pool, db: drizzle(pool, { schema }) };
  }

  return globalForDb.__feedbackCenterDb.db;
}
