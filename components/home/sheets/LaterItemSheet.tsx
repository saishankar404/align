"use client";

import { useMemo, useState } from "react";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";
import { db, type LocalLaterItem } from "@/lib/db/local";
import { syncAll } from "@/lib/db/sync";
import { useToast } from "@/lib/hooks/useToast";

export default function LaterItemSheet() {
  const context = useAppContext();
  const { showToast } = useToast();
  const item = useMemo(() => context.sheetData.item as LocalLaterItem | undefined, [context.sheetData.item]);
  const [loading, setLoading] = useState<"promote" | "drop" | null>(null);

  const isOpen = context.activeSheet === "later-item" && !!item;

  const promote = async () => {
    if (!item || !context.userId) return;
    setLoading("promote");
    await db.laterItems.update(item.id, { promoted: true, _synced: 0 });
    await context.refresh();
    context.closeSheet();
    showToast("Saved to review before your next window", "info");
    syncAll(context.userId).catch(() => undefined);
    setLoading(null);
  };

  const drop = async () => {
    if (!item || !context.userId) return;
    setLoading("drop");
    await db.laterItems.update(item.id, { dropped: true, _synced: 0 });
    await context.refresh();
    context.closeSheet();
    syncAll(context.userId).catch(() => undefined);
    setLoading(null);
  };

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-2">Later pile item</div>
        <div className="font-gtw text-[26px] tracking-[-0.025em] leading-[1.15] text-ink mb-2 break-words">{item?.content ?? ""}</div>
        {item?.note ? <p className="font-body text-[14px] text-dusk leading-[1.65] mb-5">{item.note}</p> : <div className="mb-5" />}

        <div className="flex gap-2 mb-5 mt-1">
          <button disabled={loading !== null} onClick={() => { void promote(); }} className="flex-1 py-[14px] rounded-full bg-ink text-parchment font-gtw text-[13px]">
            {loading === "promote" ? "Saving..." : "Move into window"}
          </button>
          <button disabled={loading !== null} onClick={() => { void drop(); }} className="flex-1 py-[14px] rounded-full bg-sand text-dusk font-body text-[13px]">
            {loading === "drop" ? "Saving..." : "Drop it"}
          </button>
        </div>

        <button onClick={context.closeSheet} className="w-full py-3 font-body text-[13px] text-dusk">Keep for later</button>
      </div>
    </SheetOverlay>
  );
}
