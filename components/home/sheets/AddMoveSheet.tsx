"use client";

import { useEffect, useMemo, useState } from "react";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";
import { db } from "@/lib/db/local";
import { newId } from "@/lib/utils/ids";
import { todayStr } from "@/lib/utils/dates";
import { syncAllIfCloud } from "@/lib/db/sync";

export default function AddMoveSheet() {
  const context = useAppContext();
  const isOpen = context.activeSheet === "add-move";
  const [title, setTitle] = useState("");
  const [selectedDirectionId, setSelectedDirectionId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isFull = context.todayMoves.length >= 3;
  const canSave = title.trim().length >= 1 && title.trim().length <= 80 && selectedDirectionId.length > 0;

  useEffect(() => {
    if (context.directions.length === 1) {
      setSelectedDirectionId(context.directions[0].id);
    }
  }, [context.directions]);

  const selectedDirection = useMemo(
    () => context.directions.find((item) => item.id === selectedDirectionId),
    [context.directions, selectedDirectionId]
  );

  const save = async () => {
    if (!context.userId || !context.currentCycle) return;
    if (context.todayMoves.length >= 3) return;
    if (!canSave || !selectedDirection) {
      setError("Add a title and pick a direction.");
      return;
    }

    setLoading(true);
    setError(null);
    const now = new Date().toISOString();

    await db.moves.put({
      id: newId(),
      cycleId: context.currentCycle.id,
      directionId: selectedDirection.id,
      userId: context.userId,
      title: title.trim(),
      date: todayStr(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
      _synced: 0,
    });

    await context.refresh();
    context.closeSheet();
    syncAllIfCloud(context.userId).catch(() => undefined);
    setLoading(false);
    setTitle("");
  };

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-2">Add a move</div>

        {isFull ? (
          <>
            <div className="font-gtw text-[26px] tracking-[-0.025em] leading-[1.15] text-ink mb-2">Window&apos;s full.</div>
            <p className="font-body text-[14px] text-dusk leading-[1.65] mb-6">You already have 3 moves today.</p>
            <button onClick={context.closeSheet} className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em]">Close</button>
          </>
        ) : (
          <>
            <div className="font-gtw text-[26px] tracking-[-0.025em] leading-[1.15] text-ink mb-2">What exactly today?</div>
            <p className="font-body text-[14px] text-dusk leading-[1.65] mb-4">Must be doable in one sitting.</p>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. write the hero copy"
              className="w-full px-4 py-[14px] border-[1.5px] border-dashed border-bs rounded-[10px] font-body text-[15px] text-ink bg-transparent outline-none mb-[10px]"
              maxLength={80}
            />

            <div className="font-body text-[10px] text-dusk tracking-[0.06em] mb-4">Direction:</div>
            <div className="flex flex-wrap gap-[7px] mb-5">
              {context.directions.map((direction) => (
                <button
                  key={direction.id}
                  onClick={() => setSelectedDirectionId(direction.id)}
                  className={`font-body text-[12px] px-[13px] py-[6px] rounded-full border ${selectedDirectionId === direction.id ? "bg-ink border-ink text-parchment" : "border-border text-dusk"}`}
                >
                  {direction.title}
                </button>
              ))}
            </div>

            {error ? <p className="text-sm text-terra mb-3">{error}</p> : null}

            <button
              disabled={loading}
              onClick={() => {
                void save();
              }}
              className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em] flex justify-between"
            >
              <span>{loading ? "Saving..." : "Lock in this move"}</span>
              <span>→</span>
            </button>
            <button onClick={context.closeSheet} className="w-full py-3 font-body text-[13px] text-dusk mt-2">Cancel</button>
          </>
        )}
      </div>
    </SheetOverlay>
  );
}
