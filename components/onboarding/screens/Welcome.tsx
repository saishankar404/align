"use client";

import { motion } from "framer-motion";
import DotGrid from "../shared/DotGrid";
import CtaButton from "../shared/CtaButton";
import GhostButton from "../shared/GhostButton";
import type { ScreenProps } from "../OnboardingFlow";
import { textContainerVariants, textItemVariants } from "./textVariants";

export default function Welcome({ next }: ScreenProps) {
  return (
    <motion.div className="h-full bg-ink text-parchment flex flex-col px-8 pt-[52px] pb-[44px]" variants={textContainerVariants} initial="hidden" animate="show">
      <motion.div className="font-gtw text-[32px] tracking-[-0.03em] text-center text-white/45" variants={textItemVariants}>
        Align.
      </motion.div>

      <motion.div className="flex-1 flex items-center justify-center min-h-0 relative" variants={textItemVariants}>
        <DotGrid variant="dark" showLabel />
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="absolute left-7 top-[26%] animate-[floatR_4.2s_ease-in-out_infinite]">
          <path d="M14 3 L16 10 L23 12 L16 14 L14 21 L12 14 L5 12 L12 10 Z" fill="rgba(255,255,255,.16)" />
        </svg>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute right-9 bottom-[24%] animate-[floatY_3.5s_ease-in-out_infinite]">
          <path d="M12 2 C14 8 16 10 22 12 C16 14 14 16 12 22 C10 16 8 14 2 12 C8 10 10 8 12 2 Z" fill="rgba(255,255,255,.12)" />
        </svg>
      </motion.div>

      <motion.div className="font-gtw text-[40px] font-light tracking-[-0.04em] leading-[1.1] mb-3" variants={textItemVariants}>
        so much planning,<br />
        <span className="text-forest">so little doing.</span>
      </motion.div>
      <motion.div className="font-body text-[13px] leading-[1.6] text-white/30 mb-7" variants={textItemVariants}>14 days. 3 moves a day. nothing more.</motion.div>

      <motion.div variants={textItemVariants}>
        <CtaButton onClick={next} className="bg-parchment text-ink mb-2">
          <span>Get started</span>
          <span>→</span>
        </CtaButton>
        <GhostButton onClick={next} className="text-white/30">already have an account</GhostButton>
      </motion.div>
    </motion.div>
  );
}
