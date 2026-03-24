"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useLenis } from "@/hooks/useLenis";
import DotGrid from "../shared/DotGrid";
import CtaButton from "../shared/CtaButton";
import type { ScreenProps } from "../OnboardingFlow";
import { textContainerVariants, textItemVariants } from "./textVariants";

export default function CycleScreen({ data, setData, next }: ScreenProps) {
  const duration = data.cycleLength;
  const scrollRef = useRef<HTMLDivElement>(null);
  useLenis(scrollRef);

  return (
    <motion.div ref={scrollRef} className="h-full bg-parchment text-ink overflow-y-auto" variants={textContainerVariants} initial="hidden" animate="show">
      <div className="flex min-h-full flex-col px-8 pt-[108px] pb-[52px]">
        <motion.div className="flex justify-center mb-4" variants={textItemVariants}>
          <DotGrid variant="light" showLabel />
        </motion.div>

        <motion.div className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-dusk mb-3" variants={textItemVariants}>Your window</motion.div>
        <motion.h1 className="font-gtw text-[40px] tracking-[-0.04em] leading-[1.05] mb-[10px]" variants={textItemVariants}>How long is<br />your first cycle?</motion.h1>
        <motion.p className="font-body text-[14px] leading-[1.65] text-dusk mb-6" variants={textItemVariants}>14 days — long enough to move, short enough to stay honest.</motion.p>

        <motion.div className="flex gap-[10px] mb-5" variants={textItemVariants}>
          {[7, 14].map((n) => {
            const selected = duration === n;
            return (
              <motion.button
                key={n}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => setData((prev) => ({ ...prev, cycleLength: n as 7 | 14 }))}
                className={`flex-1 rounded-[14px] px-3 py-[22px] text-center border-[1.5px] ${selected ? "border-ink bg-sand" : "border-dashed border-border"}`}
              >
                <div className={`font-gtw text-[32px] tracking-[-0.03em] ${selected ? "text-ink" : "text-dusk"}`}>{n}</div>
                <div className="font-body text-[10px] text-dusk mt-1">days</div>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div className="font-body text-[13px] leading-[1.65] text-dusk bg-sand rounded-[10px] px-4 py-[14px] mb-8" variants={textItemVariants}>
          {duration === 7
            ? "7 days moves fast. Good for a quick test before committing to 14."
            : "14 days. Long enough to matter, short enough to be real."}
        </motion.div>

        <motion.div className="mt-auto" variants={textItemVariants}>
          <CtaButton onClick={next} className="bg-ink text-parchment">
            <span>Open my window</span>
            <span>→</span>
          </CtaButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
