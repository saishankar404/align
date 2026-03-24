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
        <svg width="338" height="124" viewBox="0 0 338 124" fill="none" className="w-full mb-6 overflow-visible">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto"
            >
              <path d="M0 0 L10 5 L0 10 Z" fill="#6F6B66" />
            </marker>
          </defs>

          <rect x="14" y="34" width="90" height="52" rx="14" fill="#F2EDE4" stroke="rgba(26,26,26,0.24)" strokeWidth="1.5" />
          <circle cx="31" cy="52" r="5" fill="#E8694A" />
          <path d="M43 48 H86" stroke="rgba(26,26,26,0.22)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M43 58 H77" stroke="rgba(26,26,26,0.16)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M43 68 H81" stroke="rgba(26,26,26,0.12)" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="85" cy="68" r="2.8" fill="rgba(26,26,26,0.22)" />

          <rect x="124" y="28" width="92" height="54" rx="14" fill="#F2EDE4" stroke="rgba(26,26,26,0.27)" strokeWidth="1.6" />
          <circle cx="141" cy="47" r="5" fill="#B8AEE0" />
          <rect x="152" y="41" width="42" height="10" rx="5" fill="rgba(26,26,26,0.14)" />
          <circle cx="156" cy="65" r="6.8" fill="rgba(26,26,26,0.08)" />
          <circle cx="170" cy="65" r="6.8" fill="#B8AEE0" />
          <circle cx="184" cy="65" r="6.8" fill="rgba(26,26,26,0.08)" />
          <path d="M167.7 65.2 L170.3 67.9 L174.7 62.6" stroke="rgba(26,26,26,0.56)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />

          <rect x="234" y="36" width="90" height="52" rx="14" fill="#F2EDE4" stroke="rgba(26,26,26,0.24)" strokeWidth="1.5" />
          <circle cx="251" cy="54" r="5" fill="#5DBF8A" />
          <path d="M263 54 H306" stroke="rgba(26,26,26,0.18)" strokeWidth="2.4" strokeLinecap="round" />
          <path
            d="M277 74 A20 20 0 0 1 300 66"
            stroke="#6F6B66"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            markerEnd="url(#arrow)"
          />

          <path d="M104 58 C112 50, 117 48, 124 48" stroke="rgba(26,26,26,0.34)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M119 43 L126 48 L118 52.2" stroke="rgba(26,26,26,0.34)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          <path d="M216 54 C223 61, 228 64, 234 64" stroke="rgba(26,26,26,0.34)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M229 59 L236 64 L228 68.1" stroke="rgba(26,26,26,0.34)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <CtaButton onClick={next} className="bg-ink text-parchment">
          <span>Let&apos;s set yours up</span>
          <span>→</span>
        </CtaButton>
      </motion.div>
    </motion.div>
  );
}
