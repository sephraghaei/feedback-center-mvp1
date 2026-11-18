import { NextResponse } from "next/server";
import { adminFromRequest } from "@/lib/admin-auth";
import { deleteUser, updateUser } from "@/lib/admin-store";
import { withApiLogging } from "@/lib/api-logger";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/server";

type Context = { params: Promise<{ id: string }> };

function unauthorized(locale: Awaited<ReturnType<typeof getLocale>>) {
  return NextResponse.json({ message: localizeError("Sign in to the admin panel first.", locale) }, { status: 401 });
}

export const PATCH = withApiLogging<Context>("/api/admin/users/[id]", async (request, context, log) => {
  const locale = await getLocale();
  if (!adminFromRequest(request)) return unauthorized(locale);
  const { id } = await context.params;

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: localizeError("Invalid request.", locale) }, { status: 400 });
  }

  const result = await updateUser(id, (input ?? {}) as Record<string, unknown>);
  if ("error" in result) {
    log.warn("admin.users.update_failed", { message: result.error, context: { userId: id } });
    const status = result.error === "User not found." ? 404 : 400;
    return NextResponse.json({ message: localizeError(result.error, locale) }, { status });
  }

  log.info("admin.users.updated", { context: { userId: id } });
  return NextResponse.json({ ok: true, row: result.row });
});

export const DELETE = withApiLogging<Context>("/api/admin/users/[id]", async (request, context, log) => {
  const locale = await getLocale();
  if (!adminFromRequest(request)) return unauthorized(locale);
  const { id } = await context.params;

  const result = await deleteUser(id);
  if ("error" in result) {
    log.warn("admin.users.delete_failed", { message: result.error, context: { userId: id } });
    return NextResponse.json({ message: localizeError(result.error, locale) }, { status: 404 });
  }

  log.info("admin.users.deleted", { context: { userId: id } });
  return NextResponse.json({ ok: true, snapshot: result.snapshot });
});