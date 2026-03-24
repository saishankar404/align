import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getServerIdentityMode, hasServerLocalIdentity } from "@/lib/identity/server";

export default async function EntryPage() {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    redirect("/onboarding");
  }

  if (getServerIdentityMode() === "local" && hasServerLocalIdentity()) {
    redirect("/home");
  }

  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/onboarding");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/onboarding");
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  redirect("/home");
}
