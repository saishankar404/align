"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import {
  ENTRANCE_TRANSITION,
  EXIT_TRANSITION_STRICT,
  MOTION_DURATION,
  MOTION_SPRING,
  TAP_SCALE,
} from "@/lib/motion/tokens";

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

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    (/iphone|ipad|ipod/.test(ua) && !ua.includes("safari")) ||
    (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android")) ||
    ((window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export default function PWAInstallPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  const shouldRenderOnPath = useMemo(
    () => pathname.startsWith("/home") || pathname.startsWith("/onboarding"),
    [pathname]
  );

  useEffect(() => {
    if (!shouldRenderOnPath) return;
    setIsIOSDevice(isIOS());
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

  const handleInstall = async () => {
    if (isIOSDevice) {
      return;
    }
    if (!promptEvent) {
      return;
    }
    await promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === "accepted") {
      setVisible(false);
    }
  };

  const PromptLayer = () => {
    const isPresent = useIsPresent();
    const isIOSNative = isIOSDevice && !promptEvent;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: ENTRANCE_TRANSITION }}
        exit={{ opacity: 0, transition: EXIT_TRANSITION_STRICT }}
        className={`fixed inset-0 z-[62] bg-black/35 flex items-end px-4 pb-[calc(var(--sab)+14px)] ${isPresent ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <motion.div
          initial={{ y: 36, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: ENTRANCE_TRANSITION }}
          exit={{ y: 36, opacity: 0, transition: EXIT_TRANSITION_STRICT }}
          className="w-full rounded-[20px] bg-parchment border border-border px-5 py-4 shadow-[0_20px_70px_rgba(0,0,0,.22)]"
        >
          <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-1">Best experience</div>
          
          {isIOSNative ? (
            <>
              <div className="font-gtw text-[27px] leading-[1.05] tracking-[-0.03em] text-ink mb-2">Add to Home Screen</div>
              <p className="font-body text-[13px] leading-[1.6] text-dusk mb-4">
                Tap the Share button below, then tap &quot;Add to Home Screen&quot; for the full app experience.
              </p>
            </>
          ) : (
            <>
              <div className="font-gtw text-[27px] leading-[1.05] tracking-[-0.03em] text-ink mb-2">Install Align.</div>
              <p className="font-body text-[13px] leading-[1.6] text-dusk mb-4">
                Install for faster launch, offline access, and cleaner full-screen experience.
              </p>
            </>
          )}
          
          <div className="flex items-center gap-2">
            {isIOSNative ? (
              <div className="flex-1 rounded-full bg-ink text-parchment py-[12px] font-gtw text-[13px] tracking-[0.02em] text-center">
                Tap Share → Add to Home
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: TAP_SCALE.default }}
                transition={MOTION_SPRING.press}
                onClick={handleInstall}
                disabled={!isPresent || !promptEvent}
                className="flex-1 rounded-full bg-ink text-parchment py-[12px] font-gtw text-[13px] tracking-[0.02em] min-hit-target"
              >
                Install
              </motion.button>
            )}
            <button
              onClick={dismiss}
              disabled={!isPresent}
              className="rounded-full border border-bs bg-sand text-dusk px-4 py-[12px] font-body text-[12px] min-hit-target touch-hit-area transition-colors"
              style={{ transitionDuration: `${MOTION_DURATION.hover}s` }}
            >
              Not now
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence initial={false}>
      {visible ? <PromptLayer /> : null}
    </AnimatePresence>
  );
}