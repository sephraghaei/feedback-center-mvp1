import { NextResponse } from "next/server";
import { adminFromRequest } from "@/lib/admin-auth";
import { createUser, listUsers } from "@/lib/admin-store";
import { withApiLogging } from "@/lib/api-logger";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/server";

function unauthorized(locale: Awaited<ReturnType<typeof getLocale>>) {
  return NextResponse.json({ message: localizeError("Sign in to the admin panel first.", locale) }, { status: 401 });
}

export const GET = withApiLogging("/api/admin/users", async (request, _context, log) => {
  const locale = await getLocale();
  if (!adminFromRequest(request)) return unauthorized(locale);

  const params = request.nextUrl.searchParams;
  const result = await listUsers({
    search: params.get("search") ?? undefined,
    method: params.get("method") ?? undefined,
    profile: params.get("profile") ?? undefined,
    sort: params.get("sort") ?? undefined,
    dir: params.get("dir") ?? undefined,
    page: Number(params.get("page") ?? 1),
    pageSize: Number(params.get("pageSize") ?? 10),
  });

  log.debug("admin.users.listed", { context: { total: result.total, page: result.page } });
  return NextResponse.json(result);
});

export const POST = withApiLogging("/api/admin/users", async (request, _context, log) => {
  const locale = await getLocale();
  if (!adminFromRequest(request)) return unauthorized(locale);

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: localizeError("Invalid request.", locale) }, { status: 400 });
  }

  const result = await createUser((input ?? {}) as Record<string, unknown>);
  if ("error" in result) {
    log.warn("admin.users.create_failed", { message: result.error });
    return NextResponse.json({ message: localizeError(result.error, locale) }, { status: 400 });
  }

  log.info("admin.users.created", { context: { userId: result.row.id } });
  return NextResponse.json({ ok: true, row: result.row }, { status: 201 });
});