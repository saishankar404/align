import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function EntryPage() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  redirect("/home");
}
