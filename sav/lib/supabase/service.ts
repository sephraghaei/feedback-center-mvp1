import { createClient } from "@supabase/supabase-js";
import { assertSupabaseEnv } from "../env";
import { SCHEMA } from "./server";

export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  const { url } = assertSupabaseEnv();

  return createClient(url, serviceKey, {
    db: { schema: SCHEMA },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
