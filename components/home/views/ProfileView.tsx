"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import Calendar03Icon from "@hugeicons/core-free-icons/dist/esm/Calendar03Icon";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowUpRight01Icon";
import ActivitySparkIcon from "@hugeicons/core-free-icons/dist/esm/ActivitySparkIcon";
import AiIdeaIcon from "@hugeicons/core-free-icons/dist/esm/AiIdeaIcon";
import { useLenis } from "@/hooks/useLenis";
import { useHoldBlastAction } from "@/lib/hooks/useHoldBlastAction";
import { useAppContext } from "@/lib/context/AppContext";
import { useOnline } from "@/lib/hooks/useOnline";
import { isLocalMode } from "@/lib/identity/client";
import { db } from "@/lib/db/local";
import { syncAllIfCloud } from "@/lib/db/sync";
import { supabase } from "@/lib/supabase/client";
import { debug } from "@/lib/utils/debug";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion/tokens";

function clearAllClientCookies() {
  const cookies = document.cookie.split(";");
  const hostParts = window.location.hostname.split(".");
  const domains = [window.location.hostname];
  if (hostParts.length > 1) {
    domains.push(`.${hostParts.slice(-2).join(".")}`);
  }

  for (const cookie of cookies) {
    const cookieName = cookie.split("=")[0]?.trim();
    if (!cookieName) continue;
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    for (const domain of domains) {
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;
    }
  }
}

function SettingRow({
  title,
  subtitle,
  icon,
  onClick,
  right,
}: {
  title: string;
  subtitle: string;
  icon: any;
  onClick: () => void;
  right?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 py-3.5 border-b border-border text-left"
    >
      <span className="w-[52px] h-[52px] rounded-[18px] bg-[#E6DED1] flex items-center justify-center shrink-0">
        <HugeiconsIcon icon={icon} size={26} color="#544B3F" strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-gtw text-[25px] leading-[0.98] tracking-[-0.022em] text-ink md:hidden">{title}</span>
        <span className="hidden md:block font-gtw text-[20px] leading-[1] tracking-[-0.018em] text-ink">{title}</span>
        <span className="block font-body text-[11px] text-dusk mt-1 truncate">{subtitle}</span>
      </span>
      {right ?? <span className="font-gtw text-[20px] text-dusk/45 pr-1">›</span>}
    </button>
  );
}

export default function ProfileView() {
  const context = useAppContext();
  const router = useRouter();
  const online = useOnline();
  const scrollRef = useRef<HTMLDivElement>(null);
  useLenis(scrollRef);
  const [showNuclearDialog, setShowNuclearDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "ok" | "error">("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem("align_last_sync_at")
  );
  const shakeControls = useAnimation();
  const pageControls = useAnimation();
  const {
    isHolding: isNuclearHolding,
    progress: nuclearProgress,
    state: nuclearHoldState,
    suppressClickRef: nuclearSuppressClickRef,
    onPressStart: onNuclearPressStart,
    onPressEnd: onNuclearPressEnd,
    onPressCancel: onNuclearPressCancel,
  } = useHoldBlastAction({
    durationMs: 600,
    onComplete: () => setShowNuclearDialog(true),
  });

  const nuclearButtonRef = useRef<HTMLButtonElement | null>(null);

  const showedUpCount = useMemo(
    () => context.checkinsThisCycle.filter((item) => item.status === "showed_up").length,
    [context.checkinsThisCycle]
  );

  const profile = context.profile;
  const localMode = isLocalMode();
  const syncLabel =
    syncState === "syncing"
      ? "Syncing..."
      : syncState === "ok"
        ? "Synced"
        : syncState === "error"
          ? "Sync failed"
          : localMode
            ? "Local only"
            : online
              ? "Ready"
              : "Offline";

  const syncNow = async () => {
    if (!context.userId || !online || syncState === "syncing" || localMode) return;
    setSyncState("syncing");
    try {
      await syncAllIfCloud(context.userId, { manual: true });
      await context.refresh();
      const now = new Date().toISOString();
      localStorage.setItem("align_last_sync_at", now);
      setLastSyncedAt(now);
      setSyncState("ok");
      window.setTimeout(() => setSyncState("idle"), 1600);
    } catch {
      setSyncState("error");
      window.setTimeout(() => setSyncState("idle"), 2200);
    }
  };

  const linkGoogle = async () => {
    if (!context.userId) return;
    localStorage.setItem("align_link_local_user_id", context.userId);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=link`,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  const signOut = async () => {
    const confirmed = window.confirm("Sign out?");
    if (!confirmed) return;

    try {
      await supabase.auth.signOut();
    } finally {
      await db.delete();
      localStorage.clear();
      sessionStorage.clear();
      router.push("/auth");
    }
  };

  const nuclearReset = async () => {
    setIsResetting(true);
    try {
      let cloudDeleteFailed = false;
      if (!localMode) {
        try {
          const response = await fetch("/api/account/delete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          cloudDeleteFailed = !response.ok;
        } catch {
          cloudDeleteFailed = true;
        }
      }

      await supabase.auth.signOut().catch(() => undefined);
      await db.delete();
      indexedDB.deleteDatabase("align_db");
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      clearAllClientCookies();
      localStorage.clear();
      sessionStorage.clear();
      if (cloudDeleteFailed) {
        debug("nuclear reset cloud delete failed");
      }
    } finally {
      setIsResetting(false);
      setShowNuclearDialog(false);
      window.location.replace("/onboarding");
    }
  };

  const handleNuclearPress = async () => {
    if (isResetting) return;
    await shakeControls.start({
      x: [0, -8, 8, -6, 6, -4, 4, 0],
      transition: { duration: MOTION_DURATION.smallState, ease: MOTION_EASE.easeInOut },
    });
    setShowNuclearDialog(true);
  };

  const handleConfirmNuclear = async () => {
    await pageControls.start({
      scale: [1, 1.02, 0],
      opacity: [1, 1, 0],
      transition: { duration: MOTION_DURATION.view, ease: MOTION_EASE.easeIn },
    });
    await nuclearReset();
  };

  useEffect(() => {
    const button = nuclearButtonRef.current;
    if (!button) return;

    const onTouchStart = (event: TouchEvent) => {
      if (isResetting) return;
      onNuclearPressStart(event.target, () => {
        event.preventDefault();
      });
    };

    button.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => {
      button.removeEventListener("touchstart", onTouchStart);
    };
  }, [isResetting, onNuclearPressStart]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <motion.div animate={pageControls} style={{ transformOrigin: "center" }}>
        <div className="pb-24 px-7">
          <div className="pt-7">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-dusk mb-[10px]">Settings</div>
                <div className="font-gtw text-[40px] tracking-[-0.03em] leading-[0.96] text-ink">{profile?.name ?? ""}</div>
              </div>
              <div className="font-gtw text-[46px] leading-[0.9] tracking-[-0.03em] text-dusk/35">
                {String(context.currentDay).padStart(2, "0")}
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="grid grid-cols-3 rounded-[18px] border border-border bg-[#EEE6DA] overflow-hidden">
            {[
              [String(context.currentDay), "Days in"],
              [String(showedUpCount), "Showed up"],
              [String(context.directions.length), "Directions"],
            ].map(([num, label]) => (
              <div
                key={label}
                className={`min-h-[96px] px-2 pt-4 pb-3 flex flex-col items-center justify-center text-center ${label !== "Directions" ? "border-r border-border/90" : ""}`}
              >
                <div className="font-gtw text-[31px] tracking-[-0.03em] leading-[0.96] text-ink">{num}</div>
                <div className="font-body text-[9px] font-medium tracking-[0.09em] uppercase text-dusk mt-[5px]">{label}</div>
              </div>
            ))}
            </div>
          </div>

          <div className="pt-5 border-t border-border">
            <div className="w-full flex items-center gap-3.5 py-3.5 border-b border-border text-left opacity-60">
              <span className="w-[52px] h-[52px] rounded-[18px] bg-[#E6DED1] flex items-center justify-center shrink-0">
                <span className="font-gtw text-[11px] text-dusk">Soon</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-gtw text-[25px] leading-[0.98] tracking-[-0.022em] text-dusk md:hidden">Notifications</span>
                <span className="hidden md:block font-gtw text-[20px] leading-[1] tracking-[-0.018em] text-dusk">Notifications</span>
                <span className="block font-body text-[11px] text-dusk mt-1 truncate">Coming soon</span>
              </span>
              <span className="font-gtw text-[11px] text-dusk/70 rounded-full bg-sand px-3 py-1">Coming soon</span>
            </div>

            <SettingRow
              title="Cycle length"
              subtitle={context.currentCycle ? `${context.currentCycle.lengthDays} days · active` : "No active cycle"}
              icon={Calendar03Icon}
              onClick={() => context.openSheet("today-info")}
            />

            <SettingRow
              title="Sync"
              subtitle={`${syncLabel}${lastSyncedAt ? ` · last ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`}
              icon={ActivitySparkIcon}
              onClick={() => {
                void syncNow();
              }}
              right={
                <span
                  className={`font-gtw text-[12px] px-4 py-[8px] rounded-full ${
                    !online || syncState === "syncing" || localMode
                      ? "bg-sand text-dusk"
                      : "bg-ink text-parchment"
                  }`}
                >
                  {syncState === "syncing" ? "Syncing" : "Sync now"}
                </span>
              }
            />

            {localMode ? (
              <SettingRow
                title="Link Google"
                subtitle="Turn on cloud backup and cross-device sync"
                icon={ArrowUpRight01Icon}
                onClick={() => {
                  void linkGoogle();
                }}
              />
            ) : null}

            <SettingRow
              title="Directions"
              subtitle={
                context.directions.length > 0
                  ? `${context.directions.length} active · ${context.directions.map((direction) => direction.title).join(" · ")}`
                  : "No directions yet"
              }
              icon={AiIdeaIcon}
              onClick={() => context.openSheet("directions")}
            />

            <button onClick={() => { void signOut(); }} className="w-full mt-7 py-[14px] rounded-full bg-ink text-parchment font-gtw text-[14px]">
              Sign out
            </button>
            <motion.div animate={shakeControls}>
              <motion.button
                ref={nuclearButtonRef}
                onClick={() => {
                  if (nuclearSuppressClickRef.current) {
                    nuclearSuppressClickRef.current = false;
                    return;
                  }
                  void handleNuclearPress();
                }}
                onMouseDown={(event) => {
                  if (isResetting) return;
                  onNuclearPressStart(event.target, () => undefined);
                }}
                onMouseUp={onNuclearPressEnd}
                onMouseLeave={onNuclearPressCancel}
                onTouchEnd={onNuclearPressEnd}
                onTouchCancel={onNuclearPressCancel}
                disabled={isResetting}
                animate={
                  nuclearHoldState === "blasting"
                    ? { scale: [1, 1.05, 0.98, 1], boxShadow: ["0 0 0 rgba(232,105,74,0)", "0 0 0 14px rgba(232,105,74,0.16)", "0 0 0 22px rgba(232,105,74,0)", "0 0 0 rgba(232,105,74,0)"] }
                    : {
                        x: nuclearProgress > 0.82 ? [0, -1.5, 1.5, -1.2, 1.2, 0] : 0,
                      }
                }
                transition={nuclearHoldState === "blasting" ? { duration: MOTION_DURATION.smallState, ease: MOTION_EASE.easeOut } : { duration: MOTION_DURATION.press, ease: MOTION_EASE.easeInOut, repeat: nuclearProgress > 0.82 ? Infinity : 0 }}
                className={`relative overflow-hidden w-full mt-2 py-[12px] rounded-full border border-terra/40 bg-terra/10 text-terra font-gtw text-[12px] ${isResetting ? "opacity-60" : ""}`}
              >
                <span
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: "#E8694A",
                    opacity: isNuclearHolding || nuclearHoldState === "blasting" ? 0.22 : 0,
                    transform: `scaleY(${nuclearProgress})`,
                    transformOrigin: "bottom center",
                    transition: isNuclearHolding ? "none" : "transform 0.22s ease, opacity 0.22s ease",
                  }}
                />
                <span className="relative z-[1]">Nuclear reset</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {showNuclearDialog && typeof document !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-[82] bg-black/45 flex items-end px-4 pb-[calc(var(--sab)+14px)]">
          <div className="w-full rounded-[20px] bg-parchment border border-border p-5">
            <div className="font-body text-[9px] font-medium tracking-[0.1em] uppercase text-terra mb-1">Nuclear option</div>
            <div className="font-gtw text-[30px] tracking-[-0.03em] text-ink leading-[1.03] mb-2">Reset this app completely?</div>
            <p className="font-body text-[13px] leading-[1.6] text-dusk mb-4">
              This removes local data, cache, service workers, cookies, and active session from this browser. In cloud mode, your account and all synced data are deleted too.
            </p>

            <button
              onClick={() => {
                void handleConfirmNuclear();
              }}
              disabled={isResetting}
              className={`w-full rounded-full py-3 font-gtw text-[13px] mb-2 ${
                isResetting ? "bg-sand text-dusk" : "bg-terra text-ink"
              }`}
            >
              {isResetting ? "Resetting..." : "Yes, reset everything"}
            </button>
            <button
              onClick={() => setShowNuclearDialog(false)}
              disabled={isResetting}
              className="w-full py-2 text-[12px] text-dusk min-hit-target touch-hit-area"
            >
              Go back before I vaporize myself
            </button>
          </div>
        </div>
      , document.body)
        : null}
    </div>
  );
}
