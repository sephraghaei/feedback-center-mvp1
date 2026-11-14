import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { siteUrl } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_ATTEMPTS = 3;
const BATCH = 25;

type Announcement = {
  id: string;
  title: string;
  body: string;
  importance: "normal" | "important" | "urgent";
  published_at: string | null;
  businesses: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

type PendingRow = {
  id: string;
  user_id: string;
  attempts: number;
  announcements: Announcement | Announcement[] | null;
};

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return header.length === expected.length && timingSafeEqual(header, expected);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pickAnnouncement(value: PendingRow["announcements"]) {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function businessName(value: { name: string } | { name: string }[] | null | undefined) {
  if (!value) return "SAV";
  return Array.isArray(value) ? value[0]?.name ?? "SAV" : value.name;
}

function renderEmail(input: {
  title: string;
  body: string;
  business: string;
  importance: string;
  url: string;
}) {
  const accent =
    input.importance === "urgent"
      ? "#b42318"
      : input.importance === "important"
        ? "#946200"
        : "#146c43";
  const body = escapeHtml(input.body.slice(0, 2000)).replace(/\n/g, "<br/>");

  return `<!doctype html>
<html dir="rtl" lang="fa">
  <body style="margin:0;background:#f6f4ee;font-family:Tahoma,Arial,sans-serif;color:#15221b">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px">
      <div style="background:#fffefb;border:1px solid #e2ded2;border-radius:16px;overflow:hidden">
        <div style="height:4px;background:${accent}"></div>
        <div style="padding:24px">
          <p style="margin:0 0 8px;font-size:12px;color:#77847c">${escapeHtml(input.business)}</p>
          <h1 style="margin:0 0 12px;font-size:20px;line-height:1.7">${escapeHtml(input.title)}</h1>
          <p style="margin:0;font-size:14px;line-height:2;color:#4b5a52">${body}</p>
          <a href="${input.url}" style="display:inline-block;margin-top:20px;background:#146c43;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:10px;font-size:14px">
            خواندن در ساو
          </a>
        </div>
      </div>
      <p style="margin:16px 0 0;font-size:11px;color:#77847c;text-align:center">
        ساو | اعلان‌های کسب‌وکارها
      </p>
    </div>
  </body>
</html>`;
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "cron_not_configured" }, { status: 503 });
  }
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { sent: 0, failed: 0, pending: 0, skipped: "resend_not_configured" },
      { status: 200 },
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      id, user_id, attempts,
      announcements!inner (
        id, title, body, importance, published_at,
        businesses!inner (name, slug)
      )
    `)
    .eq("channel", "email")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(BATCH);

  if (error) {
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as PendingRow[];
  const from = process.env.RESEND_FROM ?? "SAV <onboarding@resend.dev>";
  const emails = new Map<string, string | null>();
  let sent = 0;
  let failed = 0;

  async function emailFor(userId: string) {
    if (emails.has(userId)) return emails.get(userId) ?? null;
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const address = userData.user?.email ?? null;
    emails.set(userId, address);
    return address;
  }

  for (const row of rows) {
    const announcement = pickAnnouncement(row.announcements);
    const attempts = (row.attempts ?? 0) + 1;

    if (!announcement) {
      await supabase
        .from("notifications")
        .update({ attempts, status: "failed", last_error: "announcement_missing" })
        .eq("id", row.id);
      failed += 1;
      continue;
    }

    const address = await emailFor(row.user_id);
    if (!address) {
      await supabase
        .from("notifications")
        .update({ attempts, status: "failed", last_error: "missing_email" })
        .eq("id", row.id);
      failed += 1;
      continue;
    }

    const business = businessName(announcement.businesses);
    const url = `${siteUrl}/a/${announcement.id}`;

    let ok = false;
    let failure = "";

    try {
      const response = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [address],
          subject: `${business} | ${announcement.title}`,
          html: renderEmail({
            title: announcement.title,
            body: announcement.body,
            business,
            importance: announcement.importance,
            url,
          }),
        }),
        signal: AbortSignal.timeout(10000),
      });

      ok = response.ok;
      if (!ok) failure = `resend_${response.status}`;
    } catch {
      failure = "network_error";
    }

    if (ok) {
      await supabase
        .from("notifications")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          attempts,
          last_error: null,
        })
        .eq("id", row.id);
      sent += 1;
    } else {
      await supabase
        .from("notifications")
        .update({
          attempts,
          status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
          last_error: failure.slice(0, 200),
        })
        .eq("id", row.id);
      failed += 1;
    }
  }

  return NextResponse.json({ sent, failed, pending: rows.length - sent - failed });
}
