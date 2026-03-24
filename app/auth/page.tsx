"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/Logo";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding");
  }, [router]);

  return (
    <div className="h-full w-full bg-parchment flex justify-center">
      <div className="pt-16">
        <Logo size={36} />
      </div>
    </div>
  );
}
