"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { ENTER_TRANSITION, EXIT_TRANSITION, VIEW_TRANSITION } from "@/lib/motion/tokens";

const loadingVariants = {
  enter: { x: "100%", transition: ENTER_TRANSITION },
  center: { x: 0, transition: VIEW_TRANSITION },
  exit: { x: "-12%", transition: EXIT_TRANSITION },
};

export default function AppLoading() {
  return (
    <motion.div
      variants={loadingVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="h-full w-full bg-parchment flex items-center justify-center px-8 pb-[max(44px,var(--sab))]"
    >
      <div className="flex items-center justify-center gap-[10px]">
        <Logo size={22} className="opacity-70" />
        <span className="font-gtw text-[32px] tracking-[-0.03em] text-dusk/60">Align.</span>
      </div>
    </motion.div>
  );
}
