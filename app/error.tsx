"use client";

import { useEffect } from "react";
import { Logo } from "@/components/shared/Logo";
import { recoverFromBadPwaUpdate } from "@/lib/pwa/cache";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const reloadApp = async () => {
    await recoverFromBadPwaUpdate();

    const url = new URL(window.location.href);
    url.searchParams.set("_pwaRecovery", Date.now().toString());
    window.location.replace(url.toString());
  };

  return (
    <div className="h-full w-full bg-parchment flex items-center justify-center px-8 pb-[max(44px,var(--sab))]">
      <div className="w-full max-w-[340px] rounded-[24px] border border-border bg-sand px-6 py-7 text-center shadow-[0_18px_48px_rgba(0,0,0,.12)]">
        <div className="flex justify-center mb-4">
          <Logo size={40} />
        </div>
        <p className="font-body text-[10px] uppercase tracking-[0.12em] text-dusk mb-2">Application error</p>
        <h1 className="font-gtw text-[32px] leading-[1] tracking-[-0.03em] text-ink mb-3">We hit a bad update.</h1>
        <p className="font-body text-[13px] leading-[1.55] text-dusk mb-5">
          Reload to clear broken offline files and fetch a clean version.
        </p>
        <button
          onClick={() => {
            void reloadApp();
          }}
          className="w-full rounded-full bg-ink text-parchment py-3 font-gtw text-[13px] mb-2"
        >
          Reload app
        </button>
        <button
          onClick={reset}
          className="w-full rounded-full border border-border bg-parchment text-dusk py-3 font-body text-[12px]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
