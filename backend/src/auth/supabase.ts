import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import { internalError } from "../errors";

export function getSupabaseAuthClient() {
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    throw internalError("Supabase Auth is not configured.");
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
