import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/db/types";
import { createServerClient } from "@/lib/supabase/server";

async function getAuthenticatedUserId(request: Request, url: string, anonKey: string): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;

  if (bearerToken) {
    const authClient = createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error,
    } = await authClient.auth.getUser(bearerToken);

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

  if (!url || !anonKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const userId = await getAuthenticatedUserId(request, url, anonKey);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userClient = createServerClient();

  const deletionSteps = [
    userClient.from("reflections").delete().eq("user_id", userId),
    userClient.from("checkins").delete().eq("user_id", userId),
    userClient.from("moves").delete().eq("user_id", userId),
    userClient.from("directions").delete().eq("user_id", userId),
    userClient.from("cycles").delete().eq("user_id", userId),
    userClient.from("later_items").delete().eq("user_id", userId),
    userClient.from("profiles").delete().eq("id", userId),
  ];

  const deletionResults = await Promise.all(deletionSteps);
  const deletionError = deletionResults.find((result) => result.error)?.error;

  if (deletionError) {
    console.error("synced data delete failed", {
      userId,
      message: deletionError.message,
      code: deletionError.code,
    });
    return NextResponse.json({ error: "Failed to delete synced data" }, { status: 500 });
  }

  if (!serviceRole) {
    return NextResponse.json({ ok: true, accountDeleted: false });
  }

  const adminClient = createClient<Database>(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    console.error("account delete failed", {
      userId,
      message: error.message,
      status: error.status,
    });
    return NextResponse.json({ ok: true, accountDeleted: false });
  }

  return NextResponse.json({ ok: true, accountDeleted: true });
}
