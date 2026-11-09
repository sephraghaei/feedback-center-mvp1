import { NextResponse } from "next/server";
import { adminFromRequest } from "@/lib/admin-auth";
import { restoreUser, type UserSnapshot } from "@/lib/admin-store";
import { withApiLogging } from "@/lib/api-logger";

function isSnapshot(value: unknown): value is UserSnapshot {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.createdAt === "string";
}

export const POST = withApiLogging("/api/admin/users/restore", async (request, _context, log) => {
  if (!adminFromRequest(request)) {
    return NextResponse.json({ message: "اول وارد پنل مدیریت شو." }, { status: 401 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "درخواست معتبر نیست." }, { status: 400 });
  }

  const raw = (input as { snapshots?: unknown })?.snapshots;
  const snapshots = Array.isArray(raw) ? raw.filter(isSnapshot) : isSnapshot(raw) ? [raw] : [];
  if (snapshots.length === 0) {
    return NextResponse.json({ message: "چیزی برای بازگردانی نیست." }, { status: 400 });
  }

  const rows = [];
  for (const snapshot of snapshots) {
    const result = await restoreUser(snapshot);
    if ("row" in result) rows.push(result.row);
  }

  log.info("admin.users.restored", { context: { count: rows.length } });
  return NextResponse.json({ ok: true, rows });
});