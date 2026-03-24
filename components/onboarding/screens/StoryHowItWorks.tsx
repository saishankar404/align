"use client";

import { motion } from "framer-motion";
import CtaButton from "../shared/CtaButton";
import type { ScreenProps } from "../OnboardingFlow";
import { textContainerVariants, textItemVariants } from "./textVariants";

export default function StoryHowItWorks({ next }: ScreenProps) {
  return (
    <motion.div className="h-full bg-slate px-8 pt-[52px] pb-[44px] flex flex-col text-ink" variants={textContainerVariants} initial="hidden" animate="show">
      <motion.div className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-ink/40 text-center" variants={textItemVariants}>How it works</motion.div>

      <motion.div className="flex-1 flex flex-col justify-center items-center py-5 text-center" variants={textItemVariants}>
        <h1 className="font-gtw text-[64px] tracking-[-0.04em] leading-[0.97] mb-6">Set.<br />Move.<br />Reset.</h1>
        <p className="text-[16px] leading-[1.65] text-ink/55 max-w-[270px]">
          1–3 directions. 3 moves a day. No rescheduling. Day 14 — window closes. Open a new one.
        </p>
      </motion.div>

      <motion.div variants={textItemVariants}>
        <svg width="310" height="70" viewBox="0 0 310 70" fill="none" className="w-full mb-5 overflow-visible">
          <circle cx="52" cy="28" r="26" fill="rgba(26,26,26,.1)" />
          <text x="52" y="24" fontFamily="GTW,sans-serif" fontSize="13" fontWeight="500" fill="rgba(26,26,26,.8)" textAnchor="middle">Set</text>
          <text x="52" y="38" fontFamily="Satoshi,sans-serif" fontSize="9" fill="rgba(26,26,26,.45)" textAnchor="middle">Direction</text>
          <path d="M82 28 L120 28" stroke="rgba(26,26,26,.2)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
          <path d="M115 22 L122 28 L115 34" stroke="rgba(26,26,26,.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="156" cy="28" r="26" fill="rgba(26,26,26,.1)" />
          <text x="156" y="24" fontFamily="GTW,sans-serif" fontSize="13" fontWeight="500" fill="rgba(26,26,26,.8)" textAnchor="middle">Move</text>
          <text x="156" y="38" fontFamily="Satoshi,sans-serif" fontSize="9" fill="rgba(26,26,26,.45)" textAnchor="middle">3 daily</text>
          <path d="M186 28 L224 28" stroke="rgba(26,26,26,.2)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
          <path d="M219 22 L226 28 L219 34" stroke="rgba(26,26,26,.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="258" cy="28" r="26" fill="rgba(26,26,26,.1)" />
          <text x="258" y="24" fontFamily="GTW,sans-serif" fontSize="13" fontWeight="500" fill="rgba(26,26,26,.8)" textAnchor="middle">Reset</text>
          <text x="258" y="38" fontFamily="Satoshi,sans-serif" fontSize="9" fill="rgba(26,26,26,.45)" textAnchor="middle">Day 14</text>
        </svg>
        <CtaButton onClick={next} className="bg-ink text-parchment">
          <span>Let&apos;s set yours up</span>
          <span>→</span>
        </CtaButton>
      </motion.div>
    </motion.div>
  );
}
