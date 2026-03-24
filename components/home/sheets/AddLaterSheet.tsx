"use client";

import { useMemo, useState } from "react";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";
import { db } from "@/lib/db/local";
import { newId } from "@/lib/utils/ids";
import { syncAll } from "@/lib/db/sync";

type LaterType = "link" | "idea";

function detectType(content: string): LaterType {
  try {
    new URL(content);
    return "link";
  } catch {
    return "idea";
  }
}

export default function AddLaterSheet() {
  const context = useAppContext();
  const isOpen = context.activeSheet === "add-later";
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");
  const [manualType, setManualType] = useState<LaterType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const autoType = useMemo(() => detectType(content.trim()), [content]);
  const type = manualType ?? autoType;

  const save = async () => {
    if (!context.userId) return;
    if (!content.trim()) {
      setError("Add content first.");
      return;
    }

    setLoading(true);
    setError(null);
    const now = new Date().toISOString();

    await db.laterItems.put({
      id: newId(),
      userId: context.userId,
      type,
      content: content.trim(),
      note: note.trim() || undefined,
      promoted: false,
      dropped: false,
      createdAt: now,
      _synced: 0,
    });

    await context.refresh();
    context.closeSheet();
    syncAll(context.userId).catch(() => undefined);
    setLoading(false);
    setContent("");
    setNote("");
    setManualType(null);
  };

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-2">Later pile</div>
        <div className="font-gtw text-[26px] tracking-[-0.025em] leading-[1.15] text-ink mb-2">Add a link or idea</div>

        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="paste a link or write an idea"
          className="w-full px-4 py-[14px] border-[1.5px] border-dashed border-bs rounded-[10px] font-body text-[15px] text-ink bg-transparent outline-none mb-[10px]"
        />

        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="note (optional)"
          className="w-full px-4 py-3 border-[1.5px] border-dashed border-border rounded-[10px] font-body text-[14px] text-ink bg-transparent outline-none mb-4"
        />

        <div className="flex gap-2 mb-4">
          <button onClick={() => setManualType("link")} className={`px-3 py-2 rounded-full text-xs ${type === "link" ? "bg-ink text-parchment" : "bg-sand text-dusk"}`}>Link</button>
          <button onClick={() => setManualType("idea")} className={`px-3 py-2 rounded-full text-xs ${type === "idea" ? "bg-ink text-parchment" : "bg-sand text-dusk"}`}>Idea</button>
        </div>

        {error ? <p className="text-sm text-terra mb-3">{error}</p> : null}

        <button
          disabled={loading}
          onClick={() => {
            void save();
          }}
          className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em] flex justify-between"
        >
          <span>{loading ? "Saving..." : "Save to later pile"}</span>
          <span>→</span>
        </button>
        <button onClick={context.closeSheet} className="w-full py-3 font-body text-[13px] text-dusk mt-2">Cancel</button>
      </div>
    </SheetOverlay>
  );
}
