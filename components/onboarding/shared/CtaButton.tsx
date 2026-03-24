"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { MOTION_SPRING, TAP_SCALE } from "@/lib/motion/tokens";

type CtaButtonProps = {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
};

export default function CtaButton({ onClick, children, className = "" }: CtaButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: TAP_SCALE.default }}
      transition={MOTION_SPRING.press}
      className={`w-full px-6 py-[17px] rounded-full flex items-center justify-between font-gtw text-[15px] tracking-[-0.01em] ${className}`}
    >
      {children}
    </motion.button>
  );
}
