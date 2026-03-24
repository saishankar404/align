import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  return <>{children}</>;
}
