"use client";

import { motion } from "framer-motion";
import CtaButton from "../shared/CtaButton";
import GhostButton from "../shared/GhostButton";
import type { ScreenProps } from "../OnboardingFlow";
import { textContainerVariants, textItemVariants } from "./textVariants";
import { Logo } from "@/components/shared/Logo";

export default function Welcome({ startAuth, data, next }: ScreenProps) {
  return (
    <motion.div className="relative h-full overflow-hidden bg-ink text-parchment flex flex-col px-8 pt-[52px] pb-[44px]" variants={textContainerVariants} initial="hidden" animate="show">
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-30">
        <defs>
          <pattern id="welcome-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.15)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#welcome-grid)" />
      </svg>

      <motion.div className="relative z-10 flex items-center justify-center gap-[10px]" variants={textItemVariants}>
        <div>
          <Logo size={22} src="/logo_secondary.svg" />
        </div>
        <span className="font-gtw text-[32px] tracking-[-0.03em] text-center text-white/45">Align.</span>
      </motion.div>

      <motion.div className="relative z-10 flex-1 flex items-center justify-center min-h-0" variants={textItemVariants}>
        <div className="focus-scene">
          <svg className="focus-svg" viewBox="0 0 393 260" aria-hidden>
            <g className="wire-chaos">
              <rect x="40" y="30" width="130" height="40" rx="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeDasharray="6 4" transform="rotate(-15 105 50)" />
              <rect x="230" y="50" width="110" height="40" rx="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeDasharray="6 4" transform="rotate(18 285 70)" />
              <rect x="30" y="110" width="140" height="40" rx="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeDasharray="6 4" transform="rotate(-6 100 130)" />
              <rect x="210" y="160" width="120" height="40" rx="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeDasharray="6 4" transform="rotate(12 270 180)" />
              <rect x="70" y="190" width="150" height="40" rx="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeDasharray="6 4" transform="rotate(-10 145 210)" />
            </g>

            <g transform="translate(196, 130)">
              <g className="pill-1">
                <rect x="-80" y="-20" width="160" height="40" rx="20" fill="#1A1A1A" strokeWidth="1.5" />
                <circle cx="-56" cy="0" r="6" fill="#E8694A" />
                <rect x="-36" y="-3" width="70" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
              </g>
              <g className="pill-2">
                <rect x="-80" y="-20" width="160" height="40" rx="20" fill="#1A1A1A" strokeWidth="1.5" />
                <circle cx="-56" cy="0" r="6" fill="#5DBF8A" />
                <rect x="-36" y="-3" width="90" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
              </g>
              <g className="pill-3">
                <rect x="-80" y="-20" width="160" height="40" rx="20" fill="#1A1A1A" strokeWidth="1.5" />
                <circle cx="-56" cy="0" r="6" fill="#B8AEE0" />
                <rect x="-36" y="-3" width="50" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
              </g>
            </g>
          </svg>
        </div>
      </motion.div>

      <motion.div className="relative z-10 font-gtw text-[44px] font-medium tracking-[-0.04em] leading-[1.05] mb-3" variants={textItemVariants}>
        <div className="welcome-muted-line whitespace-nowrap">so much planning,</div>
        <div>
          <span className="text-parchment">so little </span>
          <span className="text-slate">doing.</span>
        </div>
      </motion.div>
      <motion.div className="relative z-10 font-body text-[13px] leading-[1.6] welcome-subdued-copy mb-7" variants={textItemVariants}>14 days. 3 moves a day. nothing more.</motion.div>

      <motion.div className="relative z-10" variants={textItemVariants}>
        <CtaButton
          onClick={next}
          className="bg-parchment text-ink mb-2"
        >
          <span>Get started</span>
          <span>→</span>
        </CtaButton>
        <GhostButton
          onClick={() => {
            void startAuth("existing");
          }}
          className="text-white/30"
        >
          already have an account
        </GhostButton>
        {data.saveError ? <p className="mt-3 text-sm text-white/60">{data.saveError}</p> : null}
      </motion.div>
    </motion.div>
  );
}
