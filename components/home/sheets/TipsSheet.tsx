"use client";

import AiIdeaIcon from "@hugeicons/core-free-icons/dist/esm/AiIdeaIcon";
import { HugeiconsIcon } from "@hugeicons/react";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";

const TIPS = [
  "Pick 1 move you can finish in under 10 minutes.",
  "If energy is low, reduce difficulty but keep the streak alive.",
  "Use Later pile for ideas so today stays focused.",
  "Done is better than perfect. Ship one honest rep.",
  "Close the day with check-in to lock momentum.",
] as const;

export default function TipsSheet() {
  const context = useAppContext();
  const isOpen = context.activeSheet === "tips";
  const tip = TIPS[context.currentDay % TIPS.length];

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-2 mb-3">
          <HugeiconsIcon icon={AiIdeaIcon} size={14} color="#1A1A1A" strokeWidth={1.9} />
          <span className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk">Tips</span>
        </div>

        <div className="font-gtw text-[28px] tracking-[-0.03em] leading-[1.04] text-ink mb-2">
          Tip for day {context.currentDay}
        </div>
        <p className="font-body text-[14px] text-dusk leading-[1.6] mb-6">{tip}</p>

        <button
          onClick={context.closeSheet}
          className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em] flex justify-between"
        >
          <span>Got it</span>
          <span>→</span>
        </button>
      </div>
    </SheetOverlay>
  );
}
