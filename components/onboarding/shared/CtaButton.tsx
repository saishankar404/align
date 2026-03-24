"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type CtaButtonProps = {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
};

export default function CtaButton({ onClick, children, className = "" }: CtaButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`w-full px-6 py-[17px] rounded-full flex items-center justify-between font-gtw text-[15px] tracking-[-0.01em] ${className}`}
    >
      {children}
    </motion.button>
  );
}
