import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { assertSupabaseEnv } from "../env";

export const SCHEMA = "sav";

export type SavClient = Awaited<ReturnType<typeof createSupabaseServer>>;

export async function createSupabaseServer() {
  const { url, key } = assertSupabaseEnv();
  const store = await cookies();

  return createServerClient(url, key, {
    db: { schema: SCHEMA },
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(items) {
        try {
          items.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. The proxy refreshes sessions.
        }
      },
    },
  });
}
