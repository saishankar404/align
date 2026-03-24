import { createServerClient } from "@/lib/supabase/server";
import { getServerIdentityMode, hasServerLocalIdentity } from "@/lib/identity/server";
import DesktopAppEntryGate from "@/components/app/DesktopAppEntryGate";

async function getAppDestination() {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    return "/onboarding";
  }

  if (getServerIdentityMode() === "local" && hasServerLocalIdentity()) {
    return "/home";
  }

  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return "/onboarding";
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "/onboarding";
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

  if (!profile) {
    return "/onboarding";
  }

  return "/home";
}

export default async function AppLaunchPage() {
  const destination = await getAppDestination();

  return <DesktopAppEntryGate destination={destination} />;
}
