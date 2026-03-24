"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import CtaButton from "../shared/CtaButton";
import GhostButton from "../shared/GhostButton";
import type { ScreenProps } from "../OnboardingFlow";
import { textContainerVariants, textItemVariants } from "./textVariants";

type Choice = "cloud" | "local";

export default function SyncChoiceScreen({ startAuth, setData, chooseLocal, back }: ScreenProps) {
  const [selected, setSelected] = useState<Choice | null>(null);

  const onProceed = () => {
    if (selected === "cloud") {
      void startAuth();
      return;
    }
    if (selected === "local") {
      chooseLocal();
    }
  };

  return (
    <motion.div
      className="h-full bg-ink text-parchment flex flex-col px-8 pt-[52px] pb-[44px]"
      variants={textContainerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-white/40" variants={textItemVariants}>
        Choose your mode
      </motion.div>

      <motion.div className="flex-1 flex flex-col justify-center" variants={textItemVariants}>
        <h1 className="font-gtw text-[56px] tracking-[-0.045em] leading-[0.95] mb-5">
          Save local
          <br />
          or sync cloud.
        </h1>
        <p className="font-body text-[15px] leading-[1.65] text-white/50 max-w-[300px]">
          Local keeps data on this device. Cloud syncs with Google so your window travels across devices.
        </p>
      </motion.div>

      <motion.div className="space-y-3" variants={textItemVariants}>
        {["cloud", "local"].map((choice) => {
          const isCloud = choice === "cloud";
          const active = selected === choice;
          return (
            <motion.button
              key={choice}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                setData((prev) => ({ ...prev, saveError: null }));
                setSelected(choice as Choice);
              }}
              className={`relative w-full rounded-[16px] p-4 text-left border transition-all duration-200 ${
                active
                  ? isCloud
                    ? "border-slate bg-slate/15"
                    : "border-forest bg-forest/15"
                  : "border-white/8 bg-[#252525]"
              }`}
            >
              <motion.div
                initial={false}
                animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.82 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
                className="absolute top-3 right-3"
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={20}
                  color={isCloud ? "#B8AEE0" : "#5DBF8A"}
                  strokeWidth={1.9}
                />
              </motion.div>

              <div className="font-gtw text-[18px] tracking-[-0.02em] text-parchment mb-1">
                {isCloud ? "Sync with Google" : "Local only"}
              </div>
              <div className="font-body text-[12px] leading-[1.6] text-white/40">
                {isCloud
                  ? "Backup, cross-device sync, and account recovery."
                  : "Private and offline-first on this device. Link later from Profile."}
              </div>
            </motion.button>
          );
        })}

        <CtaButton
          onClick={onProceed}
          className={`${selected ? "bg-slate text-ink" : "bg-white/10 text-white/40 pointer-events-none"}`}
        >
          <span>Proceed</span>
          <span>→</span>
        </CtaButton>

        <GhostButton
          onClick={back}
          className="text-white/40"
        >
          Go back
        </GhostButton>
      </motion.div>
    </motion.div>
  );
}
