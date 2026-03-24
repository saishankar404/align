import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/db/types";
import { createServerClient } from "@/lib/supabase/server";

async function getAuthenticatedUserId(request: Request, url: string, anonKey: string): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;

  if (bearerToken) {
    const tokenClient = createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    });

    const {
      data: { user },
      error,
    } = await tokenClient.auth.getUser();

    if (!error && user) {
      return user.id;
    }
  }

  const supabase = createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  return user.id;
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRole) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const userId = await getAuthenticatedUserId(request, url, anonKey);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createClient<Database>(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Delete public data explicitly before removing the auth user so the reset
  // still clears synced records even if auth deletion hits an edge case.
  const { error: profileDeleteError } = await adminClient.from("profiles").delete().eq("id", userId);
  if (profileDeleteError) {
    return NextResponse.json({ error: "Failed to delete synced data" }, { status: 500 });
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
