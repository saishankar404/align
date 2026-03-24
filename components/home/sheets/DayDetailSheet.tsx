"use client";

import { isBefore, parseISO, startOfDay } from "date-fns";
import { useMemo } from "react";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";
import { todayStr } from "@/lib/utils/dates";
import { db, type LocalMove } from "@/lib/db/local";
import { syncAll } from "@/lib/db/sync";

function MoveRow({ move, onToggle }: { move: LocalMove; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full text-left bg-sand rounded-[12px] p-3 mb-2 flex items-center justify-between">
      <span className="font-gtw text-[16px] text-ink">{move.title}</span>
      <span className={`w-5 h-5 rounded-full ${move.status === "done" ? "bg-ink" : "border border-ink/30"}`} />
    </button>
  );
}

export default function DayDetailSheet() {
  const context = useAppContext();
  const date = typeof context.sheetData.date === "string" ? context.sheetData.date : "";
  const isOpen = context.activeSheet === "day-detail" && !!date;

  const isPast = useMemo(() => (date ? isBefore(parseISO(date), startOfDay(new Date())) : false), [date]);
  const isToday = date === todayStr();
  const isFuture = !isPast && !isToday;

  const moves = context.allMovesThisCycle.filter((item) => item.date === date);
  const checkin = context.checkinsThisCycle.find((item) => item.date === date);

  const toggleTodayMove = async (move: LocalMove) => {
    if (!context.userId || !isToday) return;
    const now = new Date().toISOString();

    if (move.status === "pending") {
      context.openSheet("mark-done", { move });
      return;
    }

    await db.moves.update(move.id, {
      status: "pending",
      doneAt: undefined,
      updatedAt: now,
      _synced: 0,
    });

    await context.refresh();
    syncAll(context.userId).catch(() => undefined);
  };

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-2">{date}</div>

        {isFuture ? (
          <div className="font-body text-[14px] text-dusk mb-6">No moves yet.</div>
        ) : null}

        {isPast ? (
          <>
            {moves.map((move) => (
              <div key={move.id} className="w-full text-left bg-sand rounded-[12px] p-3 mb-2 flex items-center justify-between">
                <span className="font-gtw text-[16px] text-ink">{move.title}</span>
                <span className={`text-xs ${move.status === "done" ? "text-forest" : "text-dusk"}`}>{move.status}</span>
              </div>
            ))}
            <div className="text-sm text-dusk mb-4">Check-in: {checkin?.status ?? "none"}</div>
          </>
        ) : null}

        {isToday ? (
          <>
            {moves.map((move) => (
              <MoveRow key={move.id} move={move} onToggle={() => { void toggleTodayMove(move); }} />
            ))}
          </>
        ) : null}

        <button onClick={context.closeSheet} className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em]">Close</button>
      </div>
    </SheetOverlay>
  );
}
