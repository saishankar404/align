"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { MOTION_SPRING, TAP_SCALE } from "@/lib/motion/tokens";

type GhostButtonProps = {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
};

export default function GhostButton({ onClick, children, className = "" }: GhostButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: TAP_SCALE.default }}
      transition={MOTION_SPRING.press}
      className={`w-full py-[13px] text-center font-body text-[13px] ${className}`}
    >
      {children}
    </motion.button>
  );
}
