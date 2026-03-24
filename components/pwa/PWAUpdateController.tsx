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
      } catch {
        // no-op
      }
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
      registration?.update().catch(() => {
        // no-op
      });
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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: ENTRANCE_TRANSITION }}
        exit={{ opacity: 0, y: -10, transition: EXIT_TRANSITION_STRICT }}
        className="fixed top-[calc(var(--sat)+10px)] left-1/2 z-[74] w-[calc(100%-24px)] max-w-[440px] -translate-x-1/2 rounded-full border border-border bg-parchment/95 backdrop-blur px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,.16)]"
      >
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 pl-2">
            <div className="font-gtw text-[13px] leading-[1] tracking-[0.01em] text-ink">Update ready</div>
            <div className="font-body text-[10px] text-dusk mt-1">A newer version is available.</div>
          </div>
          <motion.button
            whileTap={{ scale: TAP_SCALE.default }}
            transition={MOTION_SPRING.press}
            onClick={() => {
              void applyUpdate();
            }}
            disabled={isApplying}
            className="rounded-full bg-ink text-parchment px-4 py-[10px] font-gtw text-[12px] min-hit-target touch-hit-area"
            style={{ transitionDuration: `${MOTION_DURATION.hover}s` }}
          >
            {isApplying ? "Updating..." : "Update"}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
