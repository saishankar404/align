"use client";

import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { registerPushSubscription } from "@/lib/notifications/push";
import CtaButton from "../shared/CtaButton";
import GhostButton from "../shared/GhostButton";
import type { ScreenProps } from "../OnboardingFlow";
import { textContainerVariants, textItemVariants } from "./textVariants";

export default function NotificationsScreen({ next, setData }: ScreenProps) {
  const enableNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setData((prev) => ({ ...prev, notifEnabled: false }));
      next();
      return;
    }

    const success = await registerPushSubscription(user.id);
    setData((prev) => ({ ...prev, notifEnabled: success }));
    next();
  };

  return (
    <motion.div className="h-full bg-ink flex flex-col px-8 pt-[52px] pb-[44px] justify-between" variants={textContainerVariants} initial="hidden" animate="show">
      <motion.div variants={textItemVariants}>
        <div className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-white/40 mb-4">One last thing</div>
        <h1 className="font-gtw text-[44px] tracking-[-0.035em] leading-[1.05] text-parchment mb-[10px]">Let us<br />remind you<br />to show up.</h1>
        <p className="font-body text-[16px] leading-[1.6] text-white/40">Two moments a day. Nothing more.</p>
      </motion.div>

      <motion.div className="flex justify-center relative h-[148px]" variants={textItemVariants}>
        <svg width="300" height="148" viewBox="0 0 300 148" fill="none">
          <rect x="110" y="6" width="80" height="136" rx="13" stroke="rgba(184,174,224,.18)" strokeWidth="1.5" />
          <rect x="122" y="18" width="56" height="6" rx="2" fill="rgba(184,174,224,.12)" />
          <rect x="135" y="136" width="30" height="3" rx="1.5" fill="rgba(184,174,224,.12)" />

          <g className="nc1">
            <rect x="20" y="28" width="152" height="50" rx="12" fill="rgba(184,174,224,.1)" stroke="rgba(184,174,224,.2)" strokeWidth="1" />
            <circle cx="40" cy="53" r="10" fill="rgba(93,191,138,.28)" stroke="rgba(93,191,138,.45)" strokeWidth="1" />
            <path d="M36 53 L39 56 L45 50" stroke="#5DBF8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="56" y="47" fontFamily="Satoshi,sans-serif" fontSize="8" fill="rgba(255,255,255,.3)" letterSpacing=".5">MORNING · 8:00 AM</text>
            <text x="56" y="61" fontFamily="GTW,sans-serif" fontSize="10" fill="rgba(255,255,255,.4)" letterSpacing="-.2">What are you moving today?</text>
          </g>

          <g className="nc2">
            <rect x="128" y="96" width="152" height="50" rx="12" fill="rgba(184,174,224,.1)" stroke="rgba(184,174,224,.2)" strokeWidth="1" />
            <circle cx="148" cy="121" r="10" fill="rgba(184,174,224,.18)" stroke="rgba(184,174,224,.38)" strokeWidth="1" />
            <path d="M144 119 Q146 114 151 116 Q148 123 144 119Z" fill="rgba(184,174,224,.65)" />
            <text x="164" y="115" fontFamily="Satoshi,sans-serif" fontSize="8" fill="rgba(255,255,255,.3)" letterSpacing=".5">NIGHT · 9:30 PM</text>
            <text x="164" y="129" fontFamily="GTW,sans-serif" fontSize="10" fill="rgba(255,255,255,.4)" letterSpacing="-.2">Did you show up?</text>
          </g>
        </svg>
      </motion.div>

      <motion.div variants={textItemVariants}>
        <div className="flex items-center justify-between p-[15px_18px] bg-[#252525] rounded-[14px] mb-[10px]">
          <div>
            <div className="font-gtw text-[15px] tracking-[-0.01em] text-parchment mb-[2px]">Morning</div>
            <div className="font-body text-[11px] text-white/40">What are you moving today?</div>
          </div>
          <div className="font-gtw text-[12px] font-light text-white/35">8:00 AM</div>
        </div>

        <div className="flex items-center justify-between p-[15px_18px] bg-[#252525] rounded-[14px] mb-[10px]">
          <div>
            <div className="font-gtw text-[15px] tracking-[-0.01em] text-parchment mb-[2px]">Night</div>
            <div className="font-body text-[11px] text-white/40">Did you show up?</div>
          </div>
          <div className="font-gtw text-[12px] font-light text-white/35">9:30 PM</div>
        </div>

        <CtaButton onClick={enableNotifications} className="bg-slate text-ink mb-2">
          <span>Enable notifications</span>
          <span>→</span>
        </CtaButton>
        <GhostButton onClick={() => {
          setData((prev) => ({ ...prev, notifEnabled: false }));
          next();
        }} className="text-white/30">maybe later</GhostButton>
      </motion.div>
    </motion.div>
  );
}
