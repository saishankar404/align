"use client";

import { motion } from "framer-motion";
import CtaButton from "../shared/CtaButton";
import type { ScreenProps } from "../OnboardingFlow";
import { textContainerVariants, textItemVariants } from "./textVariants";

export default function StoryProblem({ next }: ScreenProps) {
  return (
    <motion.div className="h-full bg-terra px-8 pt-[52px] pb-[44px] flex flex-col text-white" variants={textContainerVariants} initial="hidden" animate="show">
      <motion.div className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-white/40" variants={textItemVariants}>The problem</motion.div>

      <motion.div className="flex-1 flex flex-col justify-center py-5" variants={textItemVariants}>
        <h1 className="font-gtw text-[72px] tracking-[-0.05em] leading-[0.97] mb-6">You plan.<br />You don&apos;t do.</h1>
        <p className="text-[16px] leading-[1.65] text-white/55 max-w-[260px]">
          Most apps give you more ways to plan. More timelines, more views, more structure to hide inside.
        </p>
      </motion.div>

      <motion.div variants={textItemVariants}>
        <svg width="320" height="60" viewBox="0 0 320 60" fill="none" className="w-full overflow-visible mb-5">
          <path d="M10 40 Q55 5 100 32 Q145 58 190 12 Q235 -15 305 22" stroke="rgba(255,255,255,.22)" strokeWidth="2" fill="none" pathLength="1" className="[stroke-dasharray:1] animate-[drawPath_1.4s_cubic-bezier(.22,1,.36,1)_both]" />
          <path d="M38 30 L46 38M46 30 L38 38" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round" />
          <path d="M185 10 L193 18M193 10 L185 18" stroke="rgba(255,255,255,.45)" strokeWidth="2" strokeLinecap="round" />
          <path d="M122 8 L130 16M130 8 L122 16" stroke="rgba(255,255,255,.38)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <CtaButton onClick={next} className="bg-parchment text-ink">
          <span>The fix</span>
          <span>→</span>
        </CtaButton>
      </motion.div>
    </motion.div>
  );
}
