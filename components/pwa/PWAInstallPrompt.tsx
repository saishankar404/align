"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function getInstallHint(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android")) {
    return "Use Share > Add to Home Screen.";
  }
  if (ua.includes("firefox")) {
    return "Use browser menu > Install app.";
  }
  return "Use browser menu > Install app.";
}

export default function PWAInstallPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showHint, setShowHint] = useState(false);

  const shouldRenderOnPath = useMemo(
    () => pathname.startsWith("/home") || pathname.startsWith("/onboarding"),
    [pathname]
  );

  useEffect(() => {
    if (!shouldRenderOnPath) return;
    const dismissed = localStorage.getItem("align_install_prompt_dismissed") === "1";
    const standalone = isStandaloneMode();
    setInstalled(standalone);
    if (!standalone && !dismissed) {
      const timer = window.setTimeout(() => setVisible(true), 1200);
      return () => window.clearTimeout(timer);
    }
  }, [shouldRenderOnPath]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!shouldRenderOnPath || installed) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem("align_install_prompt_dismissed", "1");
  };

  const install = async () => {
    if (!promptEvent) {
      setShowHint(true);
      return;
    }
    await promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === "accepted") {
      setVisible(false);
      return;
    }
    setShowHint(true);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[62] bg-black/35 flex items-end px-4 pb-[calc(var(--sab)+14px)]"
        >
          <motion.div
            initial={{ y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 36, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full rounded-[20px] bg-parchment border border-border px-5 py-4 shadow-[0_20px_70px_rgba(0,0,0,.22)]"
          >
            <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-1">Best experience</div>
            <div className="font-gtw text-[27px] leading-[1.05] tracking-[-0.03em] text-ink mb-2">Install Align.</div>
            <p className="font-body text-[13px] leading-[1.6] text-dusk mb-4">
              Install for faster launch, offline access, and cleaner full-screen experience.
            </p>
            {showHint ? (
              <p className="font-body text-[12px] leading-[1.55] text-ink mb-3">{getInstallHint()}</p>
            ) : null}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  void install();
                }}
                className="flex-1 rounded-full bg-ink text-parchment py-[12px] font-gtw text-[13px] tracking-[0.02em]"
              >
                Install
              </button>
              <button
                onClick={dismiss}
                className="rounded-full border border-bs bg-sand text-dusk px-4 py-[12px] font-body text-[12px]"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
