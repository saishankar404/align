"use client";

import { isBefore, parseISO, startOfDay } from "date-fns";
import { useMemo } from "react";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";
import { todayStr } from "@/lib/utils/dates";
import { db, type LocalMove } from "@/lib/db/local";
import { requestSyncIfCloud } from "@/lib/db/sync";

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
  const doneCount = moves.filter((item) => item.status === "done").length;

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
    requestSyncIfCloud(context.userId);
  };

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-1">Day detail</div>
        <div className="font-gtw text-[28px] tracking-[-0.03em] leading-[1] text-ink mb-2">{date}</div>

        <div className="w-full rounded-[14px] bg-sand border border-border p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-body text-[11px] text-dusk">Moves completed</span>
            <span className="font-gtw text-[18px] tracking-[-0.02em] text-ink">{doneCount}/{moves.length}</span>
          </div>
          <div className="h-[1px] bg-border my-2" />
          <div className="flex items-center justify-between">
            <span className="font-body text-[11px] text-dusk">Check-in</span>
            <span className="font-body text-[12px] text-ink capitalize">{checkin?.status?.replace("_", " ") ?? "none"}</span>
          </div>
        </div>

        {isFuture ? (
          <div className="w-full rounded-[14px] bg-sand border border-border p-4 font-body text-[14px] text-dusk mb-6">No moves yet for this day.</div>
        ) : null}

        {isPast ? (
          <>
            {moves.map((move) => (
              <div key={move.id} className="w-full text-left bg-sand rounded-[12px] p-3 mb-2 flex items-center justify-between">
                <span className="font-gtw text-[16px] text-ink">{move.title}</span>
                <span className={`text-xs ${move.status === "done" ? "text-forest" : "text-dusk"}`}>{move.status}</span>
              </div>
            ))}
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
