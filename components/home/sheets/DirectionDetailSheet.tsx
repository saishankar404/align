"use client";

import { addDays, format, parseISO } from "date-fns";
import { useMemo } from "react";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";
import type { LocalDirection } from "@/lib/db/local";

const colorClass: Record<LocalDirection["color"], string> = {
  terra: "bg-terra",
  forest: "bg-forest",
  slate: "bg-slate",
};

export default function DirectionDetailSheet() {
  const context = useAppContext();
  const direction = useMemo(() => context.sheetData.direction as LocalDirection | undefined, [context.sheetData.direction]);
  const cycle = context.currentCycle;
  const isOpen = context.activeSheet === "direction-detail" && !!direction && !!cycle;

  if (!direction || !cycle) return null;

  const dirMoves = context.allMovesThisCycle.filter((item) => item.directionId === direction.id);
  const doneDates = new Set(dirMoves.filter((item) => item.status === "done").map((item) => item.date));
  const completed = dirMoves.filter((item) => item.status === "done").length;

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${colorClass[direction.color]}`} />
          <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk">Direction</div>
        </div>

        <div className="font-gtw text-[26px] tracking-[-0.025em] leading-[1.15] text-ink mb-2">{direction.title}</div>
        <p className="font-body text-[14px] text-dusk leading-[1.6] mb-1">{completed} moves completed</p>
        <p className="font-body text-[13px] text-dusk mb-4">{context.daysRemaining} days left</p>

        <div className="flex gap-[4px] mb-6">
          {Array.from({ length: cycle.lengthDays }).map((_, index) => {
            const dateStr = format(addDays(parseISO(cycle.startDate), index), "yyyy-MM-dd");
            const filled = doneDates.has(dateStr);
            return <div key={dateStr} className={`w-[16px] h-[16px] rounded-full ${filled ? "bg-ink" : "bg-border"}`} />;
          })}
        </div>

        <button onClick={context.closeSheet} className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em] flex justify-between">
          <span>Close</span>
          <span>✕</span>
        </button>
      </div>
    </SheetOverlay>
  );
}
