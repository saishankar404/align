"use client";

import { motion } from "framer-motion";

interface InfoCardProps {
  title: string;
  subtitle: string;
  dayLabel: string;
  progress: string;
  onClick: () => void;
}

export default function InfoCard({ title, subtitle, dayLabel, progress, onClick }: InfoCardProps) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick} className="w-full mt-4 bg-sand rounded-[20px] px-5 py-[18px] text-left">
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
          <div className="h-full bg-ink rounded-[2px] transition-[width] duration-[600ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]" style={{ width: progress }} />
        </div>
      </div>
    </motion.button>
  );
}
