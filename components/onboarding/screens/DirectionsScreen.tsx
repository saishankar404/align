"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import CtaButton from "../shared/CtaButton";
import type { ScreenProps } from "../OnboardingFlow";
import { useThreadDraw } from "@/hooks/useThreadDraw";
import { useLenis } from "@/hooks/useLenis";
import { textContainerVariants, textItemVariants } from "./textVariants";

const CHIPS = [
  "landing page",
  "get fit",
  "freelance work",
  "read more",
  "learn a skill",
  "ship a project",
  "sleep better",
  "save money",
];

export default function DirectionsScreen({ data, setData, next }: ScreenProps) {
  const [d1, d2, d3] = data.directions;
  const dashOffset = useThreadDraw([d1, d2, d3]);
  const scrollRef = useRef<HTMLDivElement>(null);
  useLenis(scrollRef);

  const setDirection = (index: number, value: string) => {
    const updated = [...data.directions] as [string, string, string];
    updated[index] = value;
    setData((prev) => ({ ...prev, directions: updated }));
  };

  const chipSelected = (chip: string) => data.directions.some((value) => value.trim() === chip);

  const toggleChip = (chip: string) => {
    const updated = [...data.directions] as [string, string, string];
    const existing = updated.findIndex((value) => value.trim() === chip);

    if (existing >= 0) {
      updated[existing] = "";
      setData((prev) => ({ ...prev, directions: updated }));
      return;
    }

    const empty = updated.findIndex((value) => !value.trim());
    if (empty >= 0) {
      updated[empty] = chip;
      setData((prev) => ({ ...prev, directions: updated }));
    }
  };

  return (
    <motion.div ref={scrollRef} className="h-full bg-parchment overflow-y-auto" variants={textContainerVariants} initial="hidden" animate="show">
      <div className="px-8 pt-[108px] pb-[52px] flex min-h-full flex-col">
        <motion.div variants={textItemVariants}>
          <svg viewBox="0 0 329 120" fill="none" className="w-full h-[120px] shrink-0 mb-[14px] overflow-visible">
            <path
              d="M310 18 C300 28 290 48 275 63 C260 78 240 86 220 80 C200 74 185 56 168 50 C151 44 132 50 116 58 C100 66 86 76 68 72 C50 68 30 53 18 38"
              stroke="#DDD7CC"
              strokeWidth="1"
              fill="none"
            />
            <motion.path
              d="M310 18 C300 28 290 48 275 63 C260 78 240 86 220 80 C200 74 185 56 168 50 C151 44 132 50 116 58 C100 66 86 76 68 72 C50 68 30 53 18 38"
              stroke="#1A1A1A"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              style={{ strokeDasharray: 600, strokeDashoffset: dashOffset }}
            />
            <path d="M298 12 L312 18 L300 28" stroke="#EDE0C8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-[floatY_3.5s_ease-in-out_infinite]" />
            <motion.circle cx="220" cy="80" fill="#E8694A" initial={{ r: 0 }} animate={{ r: d1.trim() ? 7 : 0 }} transition={{ type: "spring", stiffness: 320, damping: 20 }} />
            <motion.circle cx="142" cy="50" fill="#5DBF8A" initial={{ r: 0 }} animate={{ r: d2.trim() ? 7 : 0 }} transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.08 }} />
            <motion.circle cx="60" cy="70" fill="#B8AEE0" initial={{ r: 0 }} animate={{ r: d3.trim() ? 7 : 0 }} transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.16 }} />
          </svg>
        </motion.div>

        <motion.div className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-dusk mb-3" variants={textItemVariants}>Your window</motion.div>
        <motion.h1 className="font-gtw text-[40px] tracking-[-0.04em] leading-[1.05] text-ink mb-[10px]" variants={textItemVariants}>What do you<br />want to move<br />forward on?</motion.h1>
        <motion.p className="font-body text-[14px] leading-[1.65] text-dusk mb-6" variants={textItemVariants}>Not a plan. A direction. 1–3 for the next 14 days.</motion.p>

        <motion.div className="flex flex-col gap-[10px] mb-[14px]" variants={textItemVariants}>
          {[0, 1, 2].map((i) => {
            const value = data.directions[i];
            const has = value.trim().length > 0;
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-[14px] rounded-[12px] border-[1.5px] ${has ? "border-ink bg-sand" : "border-dashed border-bs"} ${!has && i > 0 ? "opacity-35" : "opacity-100"}`}>
                <span className="font-gtw text-[13px] font-light text-dusk min-w-4">{i + 1}</span>
                <input
                  value={value}
                  onChange={(event) => setDirection(i, event.target.value)}
                  placeholder={i === 0 ? "e.g. landing page" : i === 1 ? "e.g. get fit" : "e.g. find a client"}
                  className="flex-1 font-body text-[15px] text-ink bg-transparent outline-none border-none placeholder:text-border"
                />
              </div>
            );
          })}
        </motion.div>

        <motion.div className="font-body text-[10px] font-medium tracking-[0.1em] uppercase text-dusk mb-[10px]" variants={textItemVariants}>Or pick from these</motion.div>
        <motion.div className="flex flex-wrap gap-[7px] mb-6" variants={textItemVariants}>
          {CHIPS.map((chip) => {
            const selected = chipSelected(chip);
            return (
              <motion.button
                key={chip}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => toggleChip(chip)}
                className={`font-body text-[12px] px-[14px] py-[7px] rounded-full border ${selected ? "bg-ink text-parchment border-ink" : "text-dusk border-border"}`}
              >
                {chip}
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div variants={textItemVariants}>
          <CtaButton onClick={next} className="bg-ink text-parchment mt-auto">
            <span>Set my directions</span>
            <span>→</span>
          </CtaButton>
          {data.directionsError ? <p className="mt-3 text-sm text-terra">{data.directionsError}</p> : null}
        </motion.div>
      </div>
    </motion.div>
  );
}
