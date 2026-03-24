"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { ENTRANCE_TRANSITION, EXIT_TRANSITION_STRICT, MOTION_SPRING, TAP_SCALE } from "@/lib/motion/tokens";

type DesktopAppEntryGateProps = {
  destination: string;
};

type GateState = "checking" | "desktop" | "redirecting";

function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isMobileOrTablet() {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent;
  const isTouchMac = /Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
  const mobilePattern =
    /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Windows Phone/i;
  const tabletPattern = /iPad|Tablet|PlayBook|Silk|Kindle|Nexus 7|Nexus 10|SM-T|Tab/i;

  return isTouchMac || mobilePattern.test(userAgent) || tabletPattern.test(userAgent);
}

function isDesktopBrowser() {
  if (typeof window === "undefined") return false;
  if (isStandalonePwa()) return false;
  if (isMobileOrTablet()) return false;
  return window.matchMedia("(pointer:fine)").matches;
}

export default function DesktopAppEntryGate({ destination }: DesktopAppEntryGateProps) {
  const router = useRouter();
  const [gateState, setGateState] = useState<GateState>("checking");

  useEffect(() => {
    if (isDesktopBrowser()) {
      setGateState("desktop");
      return;
    }

    setGateState("redirecting");
    router.replace(destination);
  }, [destination, router]);

  const cardMotion = useMemo(
    () => ({
      initial: { opacity: 0, y: 18, scale: 0.985 },
      animate: { opacity: 1, y: 0, scale: 1, transition: ENTRANCE_TRANSITION },
      exit: { opacity: 0, y: 12, scale: 0.99, transition: EXIT_TRANSITION_STRICT },
    }),
    []
  );

  if (gateState !== "desktop") {
    return (
      <main className="flex h-full w-full items-center justify-center bg-parchment px-8">
        <div className="flex items-center gap-[10px]">
          <Logo size={22} className="opacity-70" />
          <span className="font-gtw text-[32px] tracking-[-0.03em] text-dusk/60">Align.</span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex h-full min-h-screen w-full items-center justify-center overflow-hidden bg-parchment px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(184,174,224,0.16),transparent_45%),radial-gradient(circle_at_bottom,rgba(232,105,74,0.08),transparent_35%)]" />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: ENTRANCE_TRANSITION }}
          exit={{ opacity: 0, transition: EXIT_TRANSITION_STRICT }}
          className="absolute inset-0 bg-ink/35 backdrop-blur-[3px]"
        />
        <motion.section
          {...cardMotion}
          className="relative z-10 w-full max-w-[440px] rounded-[30px] border border-border bg-parchment p-4 shadow-[0_28px_80px_rgba(26,26,26,0.16)]"
        >
          <div className="rounded-[24px] border border-border bg-sand px-6 pb-6 pt-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-parchment">
                <Logo size={20} src="/logo_secondary.svg" />
              </div>
              <div>
                <div className="font-body text-[10px] font-medium uppercase tracking-[0.12em] text-dusk">desktop browser</div>
                <div className="font-gtw text-[24px] tracking-[-0.03em] text-ink">Align.</div>
              </div>
            </div>

            <h1 className="font-gtw text-[34px] leading-[0.95] tracking-[-0.045em] text-ink">
              this is a pwa.
              <br />
              it hits better on mobile.
            </h1>

            <p className="mt-4 font-body text-[14px] leading-[1.65] text-dusk">
              align is built for phones and tablets first. you can keep going in a desktop browser, but the app feels way better when it is installed and used like a real mobile pwa.
            </p>

            <div className="mt-5 rounded-[18px] border border-dashed border-border-subtle bg-parchment px-4 py-3">
              <div className="font-body text-[10px] font-medium uppercase tracking-[0.12em] text-dusk">best experience</div>
              <div className="mt-1 font-body text-[13px] leading-[1.55] text-ink">
                use a phone or tablet, then add it to the home screen.
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <motion.button
                type="button"
                whileTap={{ scale: TAP_SCALE.default }}
                transition={MOTION_SPRING.press}
                onClick={() => router.push("/")}
                className="min-hit-target flex-1 rounded-full border border-border bg-parchment px-5 py-[14px] font-body text-[13px] font-medium text-dusk transition-colors hover:border-border-subtle hover:text-ink"
              >
                go back to landing
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: TAP_SCALE.default }}
                transition={MOTION_SPRING.press}
                onClick={() => {
                  setGateState("redirecting");
                  router.replace(destination);
                }}
                className="min-hit-target flex-1 rounded-full bg-ink px-5 py-[14px] font-gtw text-[14px] tracking-[0.02em] text-parchment"
              >
                continue anyway
              </motion.button>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>
    </main>
  );
}
