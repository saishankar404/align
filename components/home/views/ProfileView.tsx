"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLenis } from "@/hooks/useLenis";
import { useAppContext } from "@/lib/context/AppContext";
import { registerPushSubscription } from "@/lib/notifications/push";
import { db } from "@/lib/db/local";
import { syncAll } from "@/lib/db/sync";
import { supabase } from "@/lib/supabase/client";

export default function ProfileView() {
  const context = useAppContext();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  useLenis(scrollRef);
  const [showNotif, setShowNotif] = useState(false);

  const showedUpCount = useMemo(
    () => context.checkinsThisCycle.filter((item) => item.status === "showed_up").length,
    [context.checkinsThisCycle]
  );

  const profile = context.profile;

  const updateNotif = async (updates: { notifEnabled?: boolean; notifMorningTime?: string; notifNightTime?: string }) => {
    if (!context.userId) return;

    await db.profiles.update(context.userId, updates);
    await context.refresh();
    syncAll(context.userId).catch(() => undefined);
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
              <div className="flex gap-2">
                <input type="time" value={profile?.notifMorningTime ?? "08:00"} onChange={(event) => { void updateNotif({ notifMorningTime: event.target.value }); }} className="bg-sand rounded px-2 py-1 text-sm" />
                <input type="time" value={profile?.notifNightTime ?? "21:30"} onChange={(event) => { void updateNotif({ notifNightTime: event.target.value }); }} className="bg-sand rounded px-2 py-1 text-sm" />
              </div>
            </div>
          ) : null}

          <button onClick={() => { void signOut(); }} className="w-full mt-5 py-[14px] rounded-full bg-ink text-parchment font-gtw text-[14px]">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
