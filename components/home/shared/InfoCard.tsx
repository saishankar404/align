"use client";

import { motion } from "framer-motion";
import { useAppContext } from "@/lib/context/AppContext";
import { MOTION_SPRING, TAP_SCALE } from "@/lib/motion/tokens";

interface InfoCardProps {
  title: string;
  subtitle: string;
  dayLabel: string;
  onClick: () => void;
}

export default function InfoCard({ title, subtitle, dayLabel, onClick }: InfoCardProps) {
  const { currentDay, currentCycle } = useAppContext();
  const pct = currentCycle && currentCycle.lengthDays > 0
    ? parseFloat(((currentDay / currentCycle.lengthDays) * 100).toFixed(1))
    : 0;

  return (
    <motion.button whileTap={{ scale: TAP_SCALE.soft }} transition={MOTION_SPRING.press} onClick={onClick} className="w-full mt-5 bg-sand rounded-[22px] px-[22px] py-[22px] text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-[5px]">TODAY&apos;S WINDOW</div>
          <div className="font-gtw text-[18px] tracking-[-0.02em] leading-[1.25] text-ink">{title}</div>
          <div className="font-body text-[11px] leading-[1.55] text-dusk mt-[6px]">{subtitle}</div>
        </div>
      </div>

      <div className="mt-[14px] pt-[14px] border-t border-border">
        <div className="font-body text-[10px] text-dusk">{dayLabel}</div>
        <div className="w-full h-1 bg-border rounded-[2px] overflow-hidden mt-[8px]">
          <div className="h-full bg-ink rounded-[2px] transition-[width] duration-[260ms] [transition-timing-function:linear]" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </motion.button>
  );
}
