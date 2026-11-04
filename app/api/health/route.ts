import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { databaseUrlFromEnv } from "@/lib/db/url";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type TableState = {
  users: boolean;
  profiles: boolean;
  verifications: boolean;
};

const headers = { "cache-control": "no-store" };

function response(body: Record<string, unknown>, status: number): Response {
  return NextResponse.json(body, { status, headers });
}

function failureReason(error: unknown): string {
  const source =
    typeof error === "object" && error !== null && "cause" in error
      ? (error as { cause?: unknown }).cause ?? error
      : error;
  const code =
    typeof source === "object" && source !== null && "code" in source
      ? String((source as { code?: unknown }).code)
      : "";

  switch (code) {
    case "ENOTFOUND":
      return "dns";
    case "ECONNREFUSED":
      return "connection_refused";
    case "ETIMEDOUT":
      return "timeout";
    case "28P01":
      return "auth_failed";
    case "3D000":
      return "database_missing";
    case "SELF_SIGNED_CERT_IN_CHAIN":
    case "UNABLE_TO_VERIFY_LEAF_SIGNATURE":
      return "tls";
    default:
      return "error";
  }
}

export async function GET(): Promise<Response> {
  if (!databaseUrlFromEnv()) {
    return response({ ok: false, database: "not_configured" }, 503);
  }

  try {
    const result = await getDb().execute(sql`
      select
        (
          to_regclass('public.users') is not null
          and exists (
            select 1
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'users'
              and column_name = 'phone'
          )
        ) as users,
        to_regclass('public.profiles') is not null as profiles,
        to_regclass('public.verifications') is not null as verifications
    `);

    const row = result.rows[0] as TableState | undefined;
    const tables: TableState = {
      users: Boolean(row?.users),
      profiles: Boolean(row?.profiles),
      verifications: Boolean(row?.verifications),
    };
    const ok = tables.users && tables.profiles && tables.verifications;

    return response({ ok, database: "connected", tables }, ok ? 200 : 503);
  } catch (error) {
    logger.error("health.database_failed", {
      message: "Database health check failed",
      error,
    });
    return response({ ok: false, database: "unreachable", reason: failureReason(error) }, 503);
  }
}
