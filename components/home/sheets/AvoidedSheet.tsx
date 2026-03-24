"use client";

import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";

export default function AvoidedSheet() {
  const context = useAppContext();
  const isOpen = context.activeSheet === "avoided";

  return (
    <SheetOverlay isOpen={isOpen} onClose={context.closeSheet}>
      <div className="px-7 pb-2">
        <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-2">Today</div>
        <div className="font-gtw text-[26px] tracking-[-0.025em] leading-[1.15] text-ink mb-2">You avoided today.</div>
        <p className="font-body text-[14px] text-dusk leading-[1.65] mb-6">Get back tomorrow. The window&apos;s still open.</p>
        <button onClick={context.closeSheet} className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em] flex justify-between">
          <span>OK</span>
          <span>→</span>
        </button>
      </div>
    </SheetOverlay>
  );
}
