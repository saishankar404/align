"use client";

import { useState } from "react";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";
import { db } from "@/lib/db/local";
import { newId } from "@/lib/utils/ids";
import { todayStr } from "@/lib/utils/dates";
import { syncAllIfCloud } from "@/lib/db/sync";

export default function NightCheckinSheet() {
  const context = useAppContext();
  const [loading, setLoading] = useState<"showed_up" | "avoided" | null>(null);
  const isOpen = context.activeSheet === "night-checkin";

  const writeCheckin = async (status: "showed_up" | "avoided") => {
    if (!context.userId || !context.currentCycle) return;
    setLoading(status);
    const now = new Date().toISOString();

    await db.checkins.put({
      id: newId(),
      cycleId: context.currentCycle.id,
      userId: context.userId,
      date: todayStr(),
      status,
      createdAt: now,
      _synced: 0,
    });

    await context.refresh();
    context.openSheetChain(status === "showed_up" ? "showed-up" : "avoided");
    syncAllIfCloud(context.userId).catch(() => undefined);
    setLoading(null);
  };

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-2">Night check-in</div>
        <div className="font-gtw text-[26px] tracking-[-0.025em] leading-[1.15] text-ink mb-2">Did you show up today?</div>
        <p className="font-body text-[14px] text-dusk leading-[1.65] mb-6">Day {context.currentDay} of {context.currentCycle?.lengthDays ?? 14}. Honest answer only.</p>

        <button
          disabled={loading !== null}
          onClick={() => {
            void writeCheckin("showed_up");
          }}
          className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em] flex justify-between"
        >
          <span>{loading === "showed_up" ? "Saving..." : "Yes, I showed up"}</span>
          <span>→</span>
        </button>

        <button
          disabled={loading !== null}
          onClick={() => {
            void writeCheckin("avoided");
          }}
          className="w-full py-3 font-body text-[13px] text-dusk mt-2"
        >
          {loading === "avoided" ? "Saving..." : "I avoided today"}
        </button>
      </div>
    </SheetOverlay>
  );
}
