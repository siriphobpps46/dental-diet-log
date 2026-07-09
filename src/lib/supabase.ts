import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export class SupabaseConfigError extends Error {
  constructor() {
    super("ยังไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
    this.name = "SupabaseConfigError";
  }
}

export function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new SupabaseConfigError();
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
