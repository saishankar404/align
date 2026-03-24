"use client";

import { motion } from "framer-motion";
import CtaButton from "../shared/CtaButton";
import type { ScreenProps } from "../OnboardingFlow";
import { textContainerVariants, textItemVariants } from "./textVariants";

export default function StoryFix({ next }: ScreenProps) {
  return (
    <motion.div className="h-full bg-forest px-8 pt-[52px] pb-[44px] flex flex-col text-ink" variants={textContainerVariants} initial="hidden" animate="show">
      <motion.div className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-ink/40 text-right" variants={textItemVariants}>The fix</motion.div>

      <motion.div className="flex-1 flex flex-col justify-center items-end py-5 text-right" variants={textItemVariants}>
        <h1 className="font-gtw text-[68px] tracking-[-0.04em] leading-[0.97] mb-6">A shorter<br />window.</h1>
        <p className="text-[16px] leading-[1.65] text-ink/55 max-w-[250px]">
          You only see 14 days. Plan, start, see what&apos;s next. Anything beyond that is noise.
        </p>
      </motion.div>

      <motion.div variants={textItemVariants}>
        <svg width="320" height="56" viewBox="0 0 320 56" fill="none" className="w-full mb-5">
          <line x1="16" y1="22" x2="304" y2="22" stroke="rgba(26,26,26,.15)" strokeWidth="1.5" />
          <circle cx="16" cy="22" r="6" fill="rgba(26,26,26,.75)" />
          <circle cx="38" cy="22" r="6" fill="rgba(26,26,26,.72)" />
          <circle cx="60" cy="22" r="6" fill="rgba(26,26,26,.68)" />
          <circle cx="82" cy="22" r="6" fill="rgba(26,26,26,.62)" />
          <circle cx="104" cy="22" r="6" fill="rgba(26,26,26,.55)" />
          <circle cx="126" cy="22" r="6" fill="rgba(26,26,26,.45)" />
          <circle cx="150" cy="22" r="8" fill="#1A1A1A" />
          <circle cx="174" cy="22" r="6" fill="rgba(26,26,26,.18)" />
          <circle cx="196" cy="22" r="6" fill="rgba(26,26,26,.13)" />
          <circle cx="218" cy="22" r="6" fill="rgba(26,26,26,.1)" />
          <circle cx="240" cy="22" r="6" fill="rgba(26,26,26,.08)" />
          <circle cx="262" cy="22" r="6" fill="rgba(26,26,26,.06)" />
          <circle cx="284" cy="22" r="6" fill="rgba(26,26,26,.05)" />
          <circle cx="304" cy="22" r="6" fill="rgba(26,26,26,.04)" />
          <text x="16" y="44" fontFamily="Satoshi,sans-serif" fontSize="9" fill="rgba(26,26,26,.38)" textAnchor="middle">1</text>
          <text x="150" y="44" fontFamily="Satoshi,sans-serif" fontSize="9" fill="rgba(26,26,26,.55)" textAnchor="middle">Today</text>
          <text x="304" y="44" fontFamily="Satoshi,sans-serif" fontSize="9" fill="rgba(26,26,26,.28)" textAnchor="middle">14</text>
        </svg>
        <CtaButton onClick={next} className="bg-ink text-parchment">
          <span>How it works</span>
          <span>→</span>
        </CtaButton>
      </motion.div>
    </motion.div>
  );
}
