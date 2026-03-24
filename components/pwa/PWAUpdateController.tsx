"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ENTRANCE_TRANSITION,
  EXIT_TRANSITION_STRICT,
  MOTION_DURATION,
  MOTION_SPRING,
  TAP_SCALE,
} from "@/lib/motion/tokens";
import { recoverFromBadPwaUpdate } from "@/lib/pwa/cache";

function shouldSupportSW(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
}

const CONTROLLER_RELOAD_GUARD_KEY = "align:pwa-controller-reload-at";
const CONTROLLER_RELOAD_GUARD_MS = 15_000;

function shouldAllowControllerReload(): boolean {
  if (typeof window === "undefined") return false;
  const lastValue = window.sessionStorage.getItem(CONTROLLER_RELOAD_GUARD_KEY);
  const last = lastValue ? Number(lastValue) : 0;
  const now = Date.now();
  if (last && now - last < CONTROLLER_RELOAD_GUARD_MS) {
    return false;
  }
  window.sessionStorage.setItem(CONTROLLER_RELOAD_GUARD_KEY, String(now));
  return true;
}

export default function PWAUpdateController() {
  const pathname = usePathname();
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const shouldRenderOnPath = useMemo(
    () => pathname.startsWith("/home") || pathname.startsWith("/onboarding"),
    [pathname]
  );

  useEffect(() => {
    if (!shouldSupportSW()) return;

    let didTriggerReload = false;
    let registrationRef: ServiceWorkerRegistration | null = null;

    const triggerReload = () => {
      if (didTriggerReload) return;
      if (!shouldAllowControllerReload()) return;
      didTriggerReload = true;
      window.location.reload();
    };

    const inspectWaitingWorker = () => {
      if (registrationRef?.waiting) {
        setHasUpdate(true);
      }
    };

    const attachRegistrationListeners = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return;
        registrationRef = registration;
        inspectWaitingWorker();
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setHasUpdate(true);
            }
          });
        });
      } catch {}
    };

    const onControllerChange = () => {
      triggerReload();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        inspectWaitingWorker();
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    void attachRegistrationListeners();
    void navigator.serviceWorker.getRegistration().then((registration) => {
      registration?.update().catch(() => {});
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const applyUpdate = async () => {
    if (!shouldSupportSW()) return;
    setIsApplying(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration?.waiting) {
        setIsApplying(false);
        setHasUpdate(false);
        return;
      }

      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.setTimeout(async () => {
        if (shouldAllowControllerReload()) {
          window.location.reload();
          return;
        }

        await recoverFromBadPwaUpdate();
        window.location.reload();
      }, 2200);
    } catch {
      setIsApplying(false);
    }
  };

  if (!shouldRenderOnPath || !hasUpdate) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: ENTRANCE_TRANSITION }}
        exit={{ opacity: 0, transition: EXIT_TRANSITION_STRICT }}
        className="fixed inset-0 z-[74] bg-black/40 backdrop-blur-[2px]"
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: ENTRANCE_TRANSITION }}
        exit={{ opacity: 0, y: 12, scale: 0.99, transition: EXIT_TRANSITION_STRICT }}
        className="fixed inset-0 z-[75] flex items-end justify-center px-4 pb-[calc(var(--sab)+16px)] pt-[calc(var(--sat)+16px)] sm:items-center sm:pb-4"
      >
        <div className="w-full max-w-[420px] rounded-[28px] border border-border bg-parchment p-4 shadow-[0_28px_80px_rgba(0,0,0,.18)]">
          <div className="rounded-[22px] border border-border bg-sand px-5 pb-5 pt-4">
            <div className="font-body text-[9px] font-medium uppercase tracking-[0.1em] text-slate mb-2">
              Update ready
            </div>
            <div className="font-gtw text-[30px] leading-[1.02] tracking-[-0.03em] text-ink">
              A newer version
              <br />
              is available.
            </div>
            <p className="mt-3 font-body text-[13px] leading-[1.6] text-dusk">
              Reload to pull in the latest build. This does a fresh app reload so you land on the updated version cleanly.
            </p>

            <div className="mt-5 rounded-[16px] border border-dashed border-border-subtle bg-parchment px-4 py-3">
              <div className="font-body text-[10px] font-medium uppercase tracking-[0.12em] text-dusk">
                Recommended
              </div>
              <div className="mt-1 font-body text-[12px] leading-[1.55] text-ink">
                Finish this refresh before continuing. It helps avoid stale screens and old cached assets.
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileTap={{ scale: TAP_SCALE.default }}
                transition={MOTION_SPRING.press}
                onClick={() => {
                  setHasUpdate(false);
                }}
                disabled={isApplying}
                className="min-hit-target touch-hit-area flex-1 rounded-full border border-border bg-parchment px-4 py-[13px] font-body text-[12px] text-dusk transition-colors hover:border-border-subtle hover:text-ink"
                style={{ transitionDuration: `${MOTION_DURATION.hover}s` }}
              >
                Later
              </motion.button>
              <motion.button
                whileTap={{ scale: TAP_SCALE.default }}
                transition={MOTION_SPRING.press}
                onClick={() => {
                  void applyUpdate();
                }}
                disabled={isApplying}
                className="min-hit-target touch-hit-area flex-1 rounded-full bg-ink px-4 py-[13px] font-gtw text-[13px] tracking-[0.02em] text-parchment"
                style={{ transitionDuration: `${MOTION_DURATION.hover}s` }}
              >
                {isApplying ? "Reloading..." : "Hard reload now"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
