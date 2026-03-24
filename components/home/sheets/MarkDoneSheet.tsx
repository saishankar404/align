"use client";

import { useMemo, useState } from "react";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";
import { db, type LocalMove } from "@/lib/db/local";
import { syncAllIfCloud } from "@/lib/db/sync";

export default function MarkDoneSheet() {
  const context = useAppContext();
  const [loading, setLoading] = useState(false);

  const move = useMemo(() => context.sheetData.move as LocalMove | undefined, [context.sheetData.move]);
  const isOpen = context.activeSheet === "mark-done" && !!move;

  const onYes = async () => {
    if (!move || !context.userId) return;
    setLoading(true);
    const now = new Date().toISOString();

    await db.moves.update(move.id, {
      status: "done",
      doneAt: now,
      updatedAt: now,
      _synced: 0,
    });

    await context.refresh();

    const allDone = context.todayMoves.every((item) => item.id === move.id || item.status === "done");
    context.openSheetChain("showed-up", { moveTitle: move.title, allDone });
    syncAllIfCloud(context.userId).catch(() => undefined);
    setLoading(false);
  };

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-2">
          {move?.title ?? "Move"}
        </div>
        <div className="font-gtw text-[26px] tracking-[-0.025em] leading-[1.15] text-ink mb-2">Did you actually do this?</div>
        <p className="font-body text-[14px] text-dusk leading-[1.65] mb-6">Answer honestly. The window only works if it stays real.</p>
        <button
          disabled={loading}
          onClick={() => {
            void onYes();
          }}
          className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em] flex justify-between"
        >
          <span>{loading ? "Saving..." : "Yes, I showed up"}</span>
          <span>→</span>
        </button>
        <button onClick={context.closeSheet} className="w-full py-3 font-body text-[13px] text-dusk mt-2">
          Not really
        </button>
      </div>
    </SheetOverlay>
  );
}
