"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type GhostButtonProps = {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
};

export default function GhostButton({ onClick, children, className = "" }: GhostButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`w-full py-[13px] text-center font-body text-[13px] ${className}`}
    >
      {children}
    </motion.button>
  );
}
