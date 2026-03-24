"use client";

import { motion } from "framer-motion";
import CtaButton from "../shared/CtaButton";
import type { ScreenProps } from "../OnboardingFlow";
import { textContainerVariants, textItemVariants } from "./textVariants";

export default function DoneScreen({ data, finish }: ScreenProps) {
  const displayName = data.name.trim();
  const cycleLength = data.cycleLength;

  return (
    <motion.div className="h-full bg-slate px-8 pt-[52px] pb-[44px] flex flex-col justify-between text-ink" variants={textContainerVariants} initial="hidden" animate="show">
      <motion.div className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-ink/40" variants={textItemVariants}>Window open</motion.div>

      <motion.div variants={textItemVariants}>
        <div className="flex justify-center mb-7">
          <svg width="200" height="120" viewBox="0 0 200 120" fill="none">
            <g className="animate-[floatY_3.5s_ease-in-out_infinite]">
              <motion.circle cx="100" cy="60" r="46" stroke="rgba(26,26,26,.12)" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
              <motion.circle cx="100" cy="60" r="32" stroke="rgba(26,26,26,.08)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />
              <motion.path d="M82 60 L96 74 L124 47" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} />
              <motion.path d="M40 25 L42 18 L44 25 L51 27 L44 29 L42 36 L40 29 L33 27Z" fill="rgba(26,26,26,.2)" initial={{ opacity: 0, scale: 0.45 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.85, ease: [0.34, 1.56, 0.64, 1] }} />
              <motion.path d="M162 19 L164 13 L166 19 L173 21 L166 23 L164 30 L162 23 L155 21Z" fill="rgba(26,26,26,.14)" initial={{ opacity: 0, scale: 0.45 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 1.05, ease: [0.34, 1.56, 0.64, 1] }} />
            </g>
          </svg>
        </div>

        <h1 className="font-gtw font-normal text-[52px] tracking-[-0.05em] leading-[1.05] mb-[14px]">
          {displayName ? `${displayName}'s window` : "Your window"}<br />
          is open.
        </h1>

        <p className="font-body text-[15px] leading-[1.6] text-ink/50 mb-0">Day 1 of {cycleLength}. What are you moving today?</p>
        <div className="flex gap-[5px] mt-[22px]">
          {Array.from({ length: cycleLength }).map((_, i) => (
            <div key={i} className={`w-[11px] h-[11px] rounded-full ${i === 0 ? "bg-[rgba(26,26,26,.7)]" : "bg-[rgba(26,26,26,.18)]"}`} />
          ))}
        </div>
      </motion.div>

      <motion.div className="mt-8" variants={textItemVariants}>
        <CtaButton onClick={() => {
          void finish();
        }} className="bg-ink text-slate">
          <span>Set today&apos;s moves</span>
          <span>→</span>
        </CtaButton>
        {data.saveError ? <p className="mt-3 text-sm text-ink/70">{data.saveError}</p> : null}
      </motion.div>
    </motion.div>
  );
}
