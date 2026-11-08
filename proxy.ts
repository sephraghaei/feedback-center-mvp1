import type { NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

const clerk = clerkMiddleware();

export async function proxy(request: NextRequest) {
  return clerk(request, {} as never);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
