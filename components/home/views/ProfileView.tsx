"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLenis } from "@/hooks/useLenis";
import { useAppContext } from "@/lib/context/AppContext";
import { useOnline } from "@/lib/hooks/useOnline";
import { isLocalMode } from "@/lib/identity/client";
import { registerPushSubscription } from "@/lib/notifications/push";
import { db } from "@/lib/db/local";
import { syncAllIfCloud } from "@/lib/db/sync";
import { supabase } from "@/lib/supabase/client";

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

export default function ProfileView() {
  const context = useAppContext();
  const router = useRouter();
  const online = useOnline();
  const scrollRef = useRef<HTMLDivElement>(null);
  useLenis(scrollRef);
  const [showNotif, setShowNotif] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [showNuclearDialog, setShowNuclearDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [tempMorningTime, setTempMorningTime] = useState("08:00");
  const [tempNightTime, setTempNightTime] = useState("21:30");
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "ok" | "error">("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem("align_last_sync_at")
  );

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
      await syncAllIfCloud(context.userId);
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

  const updateNotif = async (updates: { notifEnabled?: boolean; notifMorningTime?: string; notifNightTime?: string }) => {
    if (!context.userId) return;

    await db.profiles.update(context.userId, updates);
    await context.refresh();
    syncAllIfCloud(context.userId).catch(() => undefined);
  };

  const toggleNotifications = async () => {
    if (!context.userId || !profile) return;

    if (!profile.notifEnabled) {
      const allowed = await registerPushSubscription(context.userId);
      await updateNotif({ notifEnabled: allowed });
      return;
    }

    await updateNotif({ notifEnabled: false });
  };

  const openTimeDialog = () => {
    setTempMorningTime(profile?.notifMorningTime ?? "08:00");
    setTempNightTime(profile?.notifNightTime ?? "21:30");
    setShowTimeDialog(true);
  };

  const saveTimes = async () => {
    await updateNotif({ notifMorningTime: tempMorningTime, notifNightTime: tempNightTime });
    setShowTimeDialog(false);
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
      await supabase.auth.signOut();
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
    } finally {
      setIsResetting(false);
      setShowNuclearDialog(false);
      window.location.replace("/onboarding");
    }
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="pb-24">
        <div className="pt-8 px-7 text-center">
          <div className="w-[72px] h-[72px] rounded-full bg-ink mx-auto mb-[14px] flex items-center justify-center">
            <div className="font-gtw text-[28px] text-parchment">{(profile?.name?.[0] ?? "A").toUpperCase()}</div>
          </div>
          <div className="font-gtw text-[26px] tracking-[-0.02em] text-ink mb-[2px]">{profile?.name ?? ""}</div>
          <div className="font-body text-[12px] text-dusk">window · day {context.currentDay}</div>
        </div>

        <div className="grid grid-cols-3 gap-[10px] px-7 pt-5">
          {[
            [String(context.currentDay), "Days in"],
            [String(showedUpCount), "Showed up"],
            [String(context.directions.length), "Directions"],
          ].map(([num, label]) => (
            <div key={label} className="bg-sand rounded-[14px] px-3 py-4 text-center">
              <div className="font-gtw text-[28px] tracking-[-0.03em] text-ink">{num}</div>
              <div className="font-body text-[9px] font-medium tracking-[0.08em] uppercase text-dusk mt-[2px]">{label}</div>
            </div>
          ))}
        </div>

        <div className="px-7 pt-5">
          {context.directions.map((direction, index) => (
            <button key={direction.id} onClick={() => context.openSheet("direction-detail", { direction })} className={`w-full flex items-center justify-between py-[15px] border-b border-border ${index === 0 ? "border-t" : ""}`}>
              <span className="text-left">
                <span className="block font-gtw text-[16px] tracking-[-0.01em] text-ink">Direction {direction.position}</span>
                <span className="block font-body text-[11px] text-dusk mt-[2px]">{direction.title}</span>
              </span>
              <span className="font-gtw text-[18px] text-dusk/40">›</span>
            </button>
          ))}

          <button onClick={() => context.openSheet("today-info")} className="w-full flex items-center justify-between py-[15px] border-b border-border border-t">
            <span className="text-left">
              <span className="block font-gtw text-[16px] tracking-[-0.01em] text-ink">Current window</span>
              <span className="block font-body text-[11px] text-dusk mt-[2px]">Day {context.currentDay} of {context.currentCycle?.lengthDays ?? 14}</span>
            </span>
            <span className="font-gtw text-[18px] text-dusk/40">›</span>
          </button>

          <button onClick={() => setShowNotif((prev) => !prev)} className="w-full flex items-center justify-between py-[15px] border-b border-border">
            <span className="text-left">
              <span className="block font-gtw text-[16px] tracking-[-0.01em] text-ink">Notifications</span>
              <span className="block font-body text-[11px] text-dusk mt-[2px]">{profile?.notifMorningTime ?? "08:00"} · {profile?.notifNightTime ?? "21:30"}</span>
            </span>
            <span className="font-gtw text-[18px] text-dusk/40">›</span>
          </button>

          {showNotif ? (
            <div className="py-3 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-sm text-ink">Enabled</span>
                <button onClick={() => { void toggleNotifications(); }} className={`px-3 py-1 rounded-full text-xs ${profile?.notifEnabled ? "bg-ink text-parchment" : "bg-sand text-dusk"}`}>
                  {profile?.notifEnabled ? "On" : "Off"}
                </button>
              </div>
              <div className="rounded-[12px] bg-sand p-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-dusk">Morning</span>
                  <span className="font-gtw text-ink">{profile?.notifMorningTime ?? "08:00"}</span>
                </div>
                <div className="h-[1px] bg-border my-2" />
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-dusk">Night</span>
                  <span className="font-gtw text-ink">{profile?.notifNightTime ?? "21:30"}</span>
                </div>
                <button
                  onClick={openTimeDialog}
                  className="mt-3 w-full rounded-full bg-ink text-parchment py-2 font-gtw text-[12px]"
                >
                  Edit times
                </button>
              </div>
            </div>
          ) : null}

          <div className="w-full flex items-center justify-between py-[15px] border-b border-border">
            <span className="text-left">
              <span className="block font-gtw text-[16px] tracking-[-0.01em] text-ink">Sync</span>
              <span className="block font-body text-[11px] text-dusk mt-[2px]">
                {syncLabel}
                {lastSyncedAt ? ` · last ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
              </span>
            </span>
            <button
              disabled={!online || syncState === "syncing" || localMode}
              onClick={() => {
                void syncNow();
              }}
              className={`font-gtw text-[12px] px-4 py-[7px] rounded-full ${
                !online || syncState === "syncing" || localMode
                  ? "bg-sand text-dusk"
                  : "bg-ink text-parchment"
              }`}
            >
              {syncState === "syncing" ? "Syncing" : "Sync now"}
            </button>
          </div>

          {localMode ? (
            <button
              onClick={() => {
                void linkGoogle();
              }}
              className="w-full flex items-center justify-between py-[15px] border-b border-border"
            >
              <span className="text-left">
                <span className="block font-gtw text-[16px] tracking-[-0.01em] text-ink">Link Google account</span>
                <span className="block font-body text-[11px] text-dusk mt-[2px]">Turn on cloud backup and cross-device sync</span>
              </span>
              <span className="font-gtw text-[18px] text-dusk/40">›</span>
            </button>
          ) : null}

          <button onClick={() => { void signOut(); }} className="w-full mt-5 py-[14px] rounded-full bg-ink text-parchment font-gtw text-[14px]">
            Sign out
          </button>
          <button
            onClick={() => setShowNuclearDialog(true)}
            className="w-full mt-2 py-[12px] rounded-full border border-terra/40 bg-terra/10 text-terra font-gtw text-[12px]"
          >
            Nuclear reset
          </button>
        </div>
      </div>

      {showTimeDialog ? (
        <div className="fixed inset-0 z-[62] bg-black/40 flex items-end px-4 pb-[calc(var(--sab)+14px)]">
          <div className="w-full rounded-[20px] bg-parchment border border-border p-5">
            <div className="font-body text-[9px] font-medium tracking-[0.1em] uppercase text-dusk mb-1">Notification times</div>
            <div className="font-gtw text-[30px] tracking-[-0.03em] text-ink mb-4">Edit reminders</div>

            <label className="block text-[12px] text-dusk mb-1">Morning</label>
            <input
              type="time"
              value={tempMorningTime}
              onChange={(event) => setTempMorningTime(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-sand px-3 py-3 text-[15px] text-ink mb-3"
            />

            <label className="block text-[12px] text-dusk mb-1">Night</label>
            <input
              type="time"
              value={tempNightTime}
              onChange={(event) => setTempNightTime(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-sand px-3 py-3 text-[15px] text-ink mb-4"
            />

            <button
              onClick={() => { void saveTimes(); }}
              className="w-full rounded-full bg-ink text-parchment py-3 font-gtw text-[13px] mb-2"
            >
              Save
            </button>
            <button
              onClick={() => setShowTimeDialog(false)}
              className="w-full py-2 text-[12px] text-dusk"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {showNuclearDialog ? (
        <div className="fixed inset-0 z-[64] bg-black/45 flex items-end px-4 pb-[calc(var(--sab)+14px)]">
          <div className="w-full rounded-[20px] bg-parchment border border-border p-5">
            <div className="font-body text-[9px] font-medium tracking-[0.1em] uppercase text-terra mb-1">Nuclear option</div>
            <div className="font-gtw text-[30px] tracking-[-0.03em] text-ink leading-[1.03] mb-2">Reset this app completely?</div>
            <p className="font-body text-[13px] leading-[1.6] text-dusk mb-4">
              This removes local data, cache, service workers, cookies, and active session from this browser.
            </p>

            <button
              onClick={() => {
                void nuclearReset();
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
              className="w-full py-2 text-[12px] text-dusk"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
