import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/db/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${protocol}://${host}` : new URL(request.url).origin;

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
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
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
        if (!profile) {
          return NextResponse.redirect(`${baseUrl}/onboarding`);
        }
      }
    }
  }

  return NextResponse.redirect(`${baseUrl}/home`);
}
