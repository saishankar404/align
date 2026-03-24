"use client";

import { format, parseISO } from "date-fns";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";

export default function TodayInfoSheet() {
  const context = useAppContext();
  const isOpen = context.activeSheet === "today-info";
  const cycle = context.currentCycle;

  if (!cycle) return null;

  const showedUp = context.checkinsThisCycle.filter((item) => item.status === "showed_up").length;
  const avoided = context.checkinsThisCycle.filter((item) => item.status === "avoided").length;
  const moves = context.allMovesThisCycle.filter((item) => item.status === "done").length;
  const pct = Math.round((context.currentDay / cycle.lengthDays) * 100);
  const dates = `${format(parseISO(cycle.startDate), "MMM d")} – ${format(parseISO(cycle.endDate), "MMM d")}`;

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-2">Day {context.currentDay} of {cycle.lengthDays}</div>
        <div className="font-gtw text-[26px] tracking-[-0.025em] leading-[1.15] text-ink mb-4">You&apos;re {pct}% through your window.</div>

        <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-5">
          <div className="h-full bg-forest transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-sand rounded-[12px] p-3 text-center">
            <div className="font-gtw text-[24px] text-ink">{showedUp}</div>
            <div className="font-body text-[9px] uppercase tracking-[0.1em] text-dusk">Showed up</div>
          </div>
          <div className="bg-sand rounded-[12px] p-3 text-center">
            <div className="font-gtw text-[24px] text-ink">{avoided}</div>
            <div className="font-body text-[9px] uppercase tracking-[0.1em] text-dusk">Avoided</div>
          </div>
          <div className="bg-sand rounded-[12px] p-3 text-center">
            <div className="font-gtw text-[24px] text-ink">{moves}</div>
            <div className="font-body text-[9px] uppercase tracking-[0.1em] text-dusk">Moves done</div>
          </div>
        </div>

        <p className="font-body text-[13px] text-dusk mb-6">Window dates: {dates}</p>

        <button onClick={context.closeSheet} className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em] flex justify-between">
          <span>Got it</span>
          <span>→</span>
        </button>
      </div>
    </SheetOverlay>
  );
}
