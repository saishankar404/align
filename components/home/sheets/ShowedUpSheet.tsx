"use client";

import { motion } from "framer-motion";
import SheetOverlay from "./SheetOverlay";
import { useAppContext } from "@/lib/context/AppContext";

export default function ShowedUpSheet() {
  const context = useAppContext();
  const isOpen = context.activeSheet === "showed-up";
  const moveTitle = typeof context.sheetData.moveTitle === "string" ? context.sheetData.moveTitle : null;
  const allDone = context.sheetData.allDone === true;

  return (
    <SheetOverlay
      isOpen={isOpen}
      onClose={context.closeSheet}
      sheetClassName="bg-forest"
      handleClassName="bg-ink/15"
    >
      <div className="px-7 pb-[calc(var(--sab)+2px)]">
        <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-ink/50 mb-2">Today</div>
        <div className="font-gtw text-[32px] tracking-[-0.025em] leading-[1.15] text-ink mb-2">You showed up.</div>

        <div className="w-full h-[120px] rounded-[14px] bg-black/5 flex items-center justify-center mb-5">
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
            <circle cx="48" cy="48" r="32" stroke="rgba(26,26,26,.2)" strokeWidth="1.5" />
            <motion.path
              d="M34 48l8 8 20-20"
              stroke="#1A1A1A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </svg>
        </div>

        {allDone ? (
          <p className="font-body text-[14px] leading-[1.6] text-ink/70 mb-2">All moves done. You really showed up today.</p>
        ) : null}
        {moveTitle ? <p className="font-body text-[13px] text-ink/65 mb-6">Marked done: {moveTitle}</p> : <div className="mb-6" />}

        <button onClick={context.closeSheet} className="w-full px-4 py-4 rounded-full bg-ink text-forest font-gtw text-[14px] tracking-[-0.01em] flex justify-between">
          <span>Continue</span>
          <span>→</span>
        </button>
      </div>
    </SheetOverlay>
  );
}
