import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getServerIdentityMode, hasServerLocalIdentity } from "@/lib/identity/server";

export default async function AuthGuard({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    return <>{children}</>;
  }

  if (getServerIdentityMode() === "local" && hasServerLocalIdentity()) {
    return <>{children}</>;
  }

  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
