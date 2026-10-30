import { NextRequest, NextResponse } from "next/server";
import { validateProfile } from "@/lib/profile";
import {
  SESSION_COOKIE,
  readSession,
  sealSession,
  sessionCookieOptions,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ message: "اول با شماره موبایل وارد شو." }, { status: 401 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "درخواست معتبر نیست." }, { status: 400 });
  }

  const result = validateProfile(input);
  if ("error" in result) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  const updated = { ...session, profile: result.profile };
  const response = NextResponse.json({ ok: true, profile: result.profile });
  response.cookies.set({
    ...sessionCookieOptions,
    name: SESSION_COOKIE,
    value: sealSession(updated),
  });
  return response;
}
