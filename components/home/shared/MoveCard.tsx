"use client";

import { motion } from "framer-motion";
import type { LocalMove, LocalDirection } from "@/lib/db/local";

interface MoveCardProps {
  move: LocalMove;
  direction?: LocalDirection;
  tone: "warm" | "sage";
  onCardTap: () => void;
  onCheckTap: () => void;
}

export default function MoveCard({ move, direction, tone, onCardTap, onCheckTap }: MoveCardProps) {
  const done = move.status === "done";

  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onCardTap} className={`w-full rounded-2xl px-[18px] pt-[18px] pb-4 text-left ${tone === "warm" ? "bg-[#EDE0C8]" : "bg-[#C8D9BE]"} ${done ? "opacity-[.42]" : "opacity-100"}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="font-body text-[9px] font-medium tracking-[0.1em] uppercase text-dusk">{direction?.title ?? "Move"}</div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(event) => {
            event.stopPropagation();
            onCheckTap();
          }}
          className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center ${done ? "bg-ink border-ink" : "bg-transparent border-ink/20"}`}
        >
          <motion.svg width="10" height="8" viewBox="0 0 10 8" fill="none" initial={false} animate={{ scale: done ? [0, 1.15, 1] : 0, opacity: done ? 1 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.button>
      </div>
      <div className={`font-gtw text-[20px] tracking-[-0.02em] leading-[1.15] text-ink ${done ? "line-through opacity-50" : ""}`}>{move.title}</div>
    </motion.button>
  );
}
