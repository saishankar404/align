"use client";

import { format, parseISO } from "date-fns";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion/tokens";

export default function TodayInfoSheet() {
  const { activeSheet, closeSheet, currentCycle, checkinsThisCycle, allMovesThisCycle, currentDay } = useAppContext();
  const isOpen = activeSheet === "today-info";
  const cycle = currentCycle;

  if (!cycle) return null;

  const showedUp = checkinsThisCycle.filter((item) => item.status === "showed_up").length;
  const avoided = checkinsThisCycle.filter((item) => item.status === "avoided").length;
  const moves = allMovesThisCycle.filter((item) => item.status === "done").length;
  const pct = cycle && cycle.lengthDays > 0
    ? Math.round((currentDay / cycle.lengthDays) * 100)
    : 0;
  const dates = `${format(parseISO(cycle.startDate), "MMM d")} – ${format(parseISO(cycle.endDate), "MMM d")}`;

  return (
    <SheetOverlay isOpen={isOpen} onClose={closeSheet}>
      <div className="px-7 pb-2">
        <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-2">Day {currentDay} of {cycle.lengthDays}</div>
        <div className="font-gtw text-[26px] tracking-[-0.025em] leading-[1.15] text-ink mb-4">You&apos;re {pct}% through your window.</div>

        <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-5">
          <div
            style={{
              height: "4px",
              background: "#5DBF8A",
              borderRadius: "2px",
              width: `${pct}%`,
              transition: `width ${MOTION_DURATION.view}s ${MOTION_EASE.linear}`,
            }}
          />
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

        <button onClick={closeSheet} className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em] flex justify-between">
          <span>Got it</span>
          <span>→</span>
        </button>
      </div>
    </SheetOverlay>
  );
}
