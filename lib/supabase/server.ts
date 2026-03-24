import { createServerClient as createSupabaseServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/db/types";

export function createServerClient() {
  const cookieStore = cookies();
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { [key: string]: unknown }) {
          cookieStore.set({ name, value, ...(options as Record<string, string | number | boolean>) });
        },
        remove(name: string, options: { [key: string]: unknown }) {
          cookieStore.set({
            name,
            value: "",
            ...(options as Record<string, string | number | boolean>),
            maxAge: 0,
          });
        },
      },
    }
  );
}
