"use client";

import AiIdeaIcon from "@hugeicons/core-free-icons/dist/esm/AiIdeaIcon";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowUpRight01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";

export default function DirectionsSheet() {
  const context = useAppContext();
  const isOpen = context.activeSheet === "directions";

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-2 mb-3">
          <HugeiconsIcon icon={AiIdeaIcon} size={14} color="#1A1A1A" strokeWidth={1.9} />
          <span className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk">This cycle</span>
        </div>

        <div className="font-gtw text-[28px] tracking-[-0.03em] leading-[1.04] text-ink mb-4">Your directions</div>

        {context.directions.length === 0 ? (
          <p className="font-body text-[14px] leading-[1.6] text-dusk mb-6">No directions added yet.</p>
        ) : (
          <div className="border-y border-border mb-6">
            {context.directions.map((direction, index) => (
              <button
                key={direction.id}
                onClick={() => context.openSheetChain("direction-detail", { direction })}
                className={`w-full flex items-center justify-between py-4 ${index < context.directions.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="text-left min-w-0">
                  <div className="font-body text-[9px] tracking-[0.1em] uppercase text-dusk mb-1">
                    Direction {String(direction.position).padStart(2, "0")}
                  </div>
                  <div className="font-gtw text-[20px] tracking-[-0.02em] leading-[1.12] text-ink truncate">{direction.title}</div>
                </div>
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} color="#9E9485" strokeWidth={2} />
              </button>
            ))}
          </div>
        )}

        <button
          onClick={context.closeSheet}
          className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em] flex justify-between"
        >
          <span>Close</span>
          <span>✕</span>
        </button>
      </div>
    </SheetOverlay>
  );
}
