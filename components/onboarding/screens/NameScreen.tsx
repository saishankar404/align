"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import CtaButton from "../shared/CtaButton";
import type { ScreenProps } from "../OnboardingFlow";
import { useActiveField } from "@/hooks/useActiveField";
import { textContainerVariants, textItemVariants } from "./textVariants";

function calcFontSize(value: string, containerWidth: number): number {
  if (!value || containerWidth <= 0) return 72;
  const len = value.length;
  const byLength = Math.max(36, Math.min(72, Math.floor(containerWidth / (len * 0.55))));
  return byLength;
}

export default function NameScreen({ data, setData, next }: ScreenProps) {
  const { activeField, switchField, focusField, nameInputRef, ageInputRef } = useActiveField();
  const [nameFocused, setNameFocused] = useState(false);
  const [ageFocused, setAgeFocused] = useState(false);
  const [nameContainerWidth, setNameContainerWidth] = useState(0);
  const [ageContainerWidth, setAgeContainerWidth] = useState(0);
  const nameDisplayRef = useRef<HTMLDivElement | null>(null);
  const ageDisplayRef = useRef<HTMLDivElement | null>(null);

  const name = data.name;
  const age = data.age;
  const hasName = name.trim().length > 0;
  const hasAge = age.trim().length > 0;
  const nameDisplayValue = hasName ? name : "Your name";
  const ageDisplayValue = hasAge ? age : "Age";
  const nameFontSize = calcFontSize(nameDisplayValue, nameContainerWidth);
  const ageFontSize = calcFontSize(ageDisplayValue, ageContainerWidth);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        switchField();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [switchField]);

  useEffect(() => {
    const nameNode = nameDisplayRef.current;
    const ageNode = ageDisplayRef.current;
    if (!nameNode || !ageNode) return;

    const updateWidths = () => {
      setNameContainerWidth(nameNode.clientWidth);
      setAgeContainerWidth(ageNode.clientWidth);
    };

    updateWidths();
    const observer = new ResizeObserver(updateWidths);
    observer.observe(nameNode);
    observer.observe(ageNode);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (nameDisplayRef.current) {
      setNameContainerWidth(nameDisplayRef.current.clientWidth);
    }
    if (ageDisplayRef.current) {
      setAgeContainerWidth(ageDisplayRef.current.clientWidth);
    }
  }, [name, age]);

  return (
    <motion.div className="h-full bg-parchment flex flex-col" variants={textContainerVariants} initial="hidden" animate="show">
      <motion.div className="px-8 pt-[108px]" variants={textItemVariants}>
        <div className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-dusk mb-3">Quick intro</div>
        <h1 className="font-gtw text-[40px] tracking-[-0.04em] leading-[1.05] text-ink mb-[10px]">What should<br />Align. call you?</h1>
        <p className="font-body text-[14px] leading-[1.65] text-dusk">Type directly. Tab to switch fields.</p>
      </motion.div>

      <motion.div className="flex-1 flex flex-col justify-center px-8 -mt-8" variants={textItemVariants}>
        <div className={`font-body text-[10px] tracking-[0.12em] uppercase mb-1 ${activeField === "name" ? "text-ink opacity-100 font-medium" : "text-dusk opacity-70 font-medium"}`}>Your name</div>
        <div
          ref={nameDisplayRef}
          className="mb-1 cursor-text"
          style={{
            width: "100%",
            overflow: "visible",
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => {
            switchField("name");
            focusField("name");
          }}
          role="button"
          tabIndex={-1}
        >
          <div
            className="font-gtw font-light tracking-[-0.06em] inline-flex items-end"
            style={{
              fontSize: `${nameFontSize}px`,
              lineHeight: 1.08,
              color: hasName ? "#1A1A1A" : "rgba(26,26,26,0.25)",
              whiteSpace: "nowrap",
              overflow: "visible",
              paddingBottom: "0.08em",
              maxWidth: "100%",
            }}
          >
            {nameFocused && !hasName && <span className="inline-block w-[3px] rounded-[2px] bg-slate mr-[6px] animate-[blink_.85s_ease-in-out_infinite] shrink-0" style={{ height: "0.88em", marginBottom: "0.04em" }} />}
            <span>{nameDisplayValue}</span>
            {nameFocused && hasName && <span className="inline-block w-[3px] rounded-[2px] bg-slate ml-[6px] animate-[blink_.85s_ease-in-out_infinite] shrink-0" style={{ height: "0.88em", marginBottom: "0.04em" }} />}
          </div>
        </div>

        <div className={`font-body text-[10px] tracking-[0.12em] uppercase mt-[18px] ${activeField === "age" ? "text-ink opacity-100 font-medium" : "text-dusk opacity-70 font-medium"}`}>Your age</div>
        <div
          ref={ageDisplayRef}
          className="cursor-text"
          style={{
            width: "100%",
            overflow: "visible",
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => {
            switchField("age");
            focusField("age");
          }}
          role="button"
          tabIndex={-1}
        >
          <div
            className="font-gtw font-light tracking-[-0.06em] inline-flex items-end"
            style={{
              fontSize: `${ageFontSize}px`,
              lineHeight: 1.08,
              color: hasAge ? "#1A1A1A" : "rgba(26,26,26,0.25)",
              whiteSpace: "nowrap",
              overflow: "visible",
              paddingBottom: "0.08em",
              maxWidth: "100%",
            }}
          >
            {ageFocused && !hasAge && <span className="inline-block w-[3px] rounded-[2px] bg-slate mr-[6px] animate-[blink_.85s_ease-in-out_infinite] shrink-0" style={{ height: "0.88em", marginBottom: "0.04em" }} />}
            <span>{ageDisplayValue}</span>
            {ageFocused && hasAge && <span className="inline-block w-[3px] rounded-[2px] bg-slate ml-[6px] animate-[blink_.85s_ease-in-out_infinite] shrink-0" style={{ height: "0.88em", marginBottom: "0.04em" }} />}
          </div>
        </div>
      </motion.div>

      <motion.div className="px-8 pb-[44px]" variants={textItemVariants}>
        <div className="flex gap-2 mb-[14px]">
          <button onClick={() => switchField("name")} className={`font-body text-[11px] font-medium tracking-[0.07em] uppercase py-[7px] px-4 rounded-full min-hit-target touch-hit-area ${activeField === "name" ? "bg-ink text-parchment" : "bg-sand text-dusk"}`}>Name</button>
          <button onClick={() => switchField("age")} className={`font-body text-[11px] font-medium tracking-[0.07em] uppercase py-[7px] px-4 rounded-full min-hit-target touch-hit-area ${activeField === "age" ? "bg-ink text-parchment" : "bg-sand text-dusk"}`}>Age</button>
        </div>

        <CtaButton onClick={next} className="bg-ink text-parchment">
          <span>Continue</span>
          <span>→</span>
        </CtaButton>
        {data.nameError ? <p className="mt-3 text-sm text-terra">{data.nameError}</p> : null}
      </motion.div>

      <input
        ref={nameInputRef}
        className="fixed left-[-9999px] top-[-9999px] opacity-0"
        type="text"
        inputMode="text"
        value={name}
        onFocus={() => setNameFocused(true)}
        onBlur={() => setNameFocused(false)}
        onChange={(event) => setData((prev) => ({ ...prev, name: event.target.value }))}
        autoComplete="given-name"
      />
      <input
        ref={ageInputRef}
        className="fixed left-[-9999px] top-[-9999px] opacity-0"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={age}
        onFocus={() => setAgeFocused(true)}
        onBlur={() => setAgeFocused(false)}
        onChange={(event) => {
          const digitsOnly = event.target.value.replace(/\D+/g, "").slice(0, 2);
          setData((prev) => ({ ...prev, age: digitsOnly }));
        }}
      />
    </motion.div>
  );
}
