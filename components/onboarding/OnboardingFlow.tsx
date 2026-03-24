"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { addDays, format } from "date-fns";
import { db } from "@/lib/db/local";
import { syncAll } from "@/lib/db/sync";
import { supabase } from "@/lib/supabase/client";
import { newId } from "@/lib/utils/ids";
import Welcome from "./screens/Welcome";
import StoryProblem from "./screens/StoryProblem";
import StoryFix from "./screens/StoryFix";
import StoryHowItWorks from "./screens/StoryHowItWorks";
import NameScreen from "./screens/NameScreen";
import DirectionsScreen from "./screens/DirectionsScreen";
import CycleScreen from "./screens/CycleScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import DoneScreen from "./screens/DoneScreen";

export type OnboardingData = {
  name: string;
  age: string;
  directions: [string, string, string];
  cycleLength: 7 | 14;
  notifEnabled: boolean;
  isSaving: boolean;
  saveError: string | null;
  nameError: string | null;
  directionsError: string | null;
};

export type ScreenProps = {
  data: OnboardingData;
  setData: Dispatch<SetStateAction<OnboardingData>>;
  next: () => void;
  back: () => void;
  finish: () => void;
};

const screenVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-35%",
  }),
  center: {
    x: 0,
    transition: {
      duration: 0.46,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-12%" : "100%",
    transition: {
      duration: 0.46,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<OnboardingData>({
      name: "",
      age: "",
      directions: ["", "", ""],
      cycleLength: 14,
      notifEnabled: false,
      isSaving: false,
      saveError: null,
      nameError: null,
      directionsError: null,
    });

  const steps = useMemo(
    () => [
      Welcome,
      StoryProblem,
      StoryFix,
      StoryHowItWorks,
      NameScreen,
      DirectionsScreen,
      CycleScreen,
      NotificationsScreen,
      DoneScreen,
    ],
    []
  );

  const CurrentScreen = steps[step];

  const next = () => {
    if (step === 4) {
      if (!data.name.trim()) {
        setData((prev) => ({ ...prev, nameError: "What should we call you?" }));
        return;
      }
      if (data.age.trim()) {
        const ageValue = Number.parseInt(data.age, 10);
        if (Number.isNaN(ageValue) || ageValue < 13 || ageValue > 120) {
          setData((prev) => ({ ...prev, nameError: "Age must be between 13 and 120." }));
          return;
        }
      }
      setData((prev) => ({ ...prev, nameError: null }));
    }

    if (step === 5) {
      const valid = data.directions.filter((d) => d.trim().length > 0);
      if (!valid.length) {
        setData((prev) => ({ ...prev, directionsError: "Add at least one direction." }));
        return;
      }
      setData((prev) => ({ ...prev, directionsError: null }));
    }

    if (step < steps.length - 1) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  const back = () => {
    if (step > 4) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const finish = async () => {
    setData((prev) => ({ ...prev, isSaving: true, saveError: null }));

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No session");
      }

      const now = new Date().toISOString();
      const today = format(new Date(), "yyyy-MM-dd");
      const cycleId = newId();
      const colorMap: Array<"terra" | "forest" | "slate"> = ["terra", "forest", "slate"];
      const validDirections = data.directions.map((d) => d.trim()).filter((d) => d.length > 0);

      await db.profiles.put({
        id: user.id,
        name: data.name.trim(),
        age: data.age ? Number.parseInt(data.age, 10) : undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifEnabled: data.notifEnabled,
        notifMorningTime: "08:00",
        notifNightTime: "21:30",
        pushSubscription: localStorage.getItem("align_push_sub") ?? undefined,
      });

      await db.cycles.put({
        id: cycleId,
        userId: user.id,
        startDate: today,
        endDate: format(addDays(new Date(), data.cycleLength - 1), "yyyy-MM-dd"),
        lengthDays: data.cycleLength,
        status: "active",
        createdAt: now,
        _synced: 0,
      });

      await Promise.all(
        validDirections.map((title, index) =>
          db.directions.put({
            id: newId(),
            cycleId,
            userId: user.id,
            title,
            color: colorMap[index],
            position: (index + 1) as 1 | 2 | 3,
            createdAt: now,
            _synced: 0,
          })
        )
      );

      localStorage.setItem("align_onboarded", "true");
      syncAll(user.id).catch(() => undefined);
      router.push("/home");
    } catch {
      setData((prev) => ({
        ...prev,
        isSaving: false,
        saveError: "Something went wrong. Try again.",
      }));
    }
  };

  const showTopUI = step >= 4 && step <= 7;
  const progressStep = step - 3;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-parchment">
      {showTopUI && (
        <>
          <div className="absolute top-[54px] left-8 right-8 h-[2px] bg-ink/10 rounded-[2px] z-50">
            <motion.div
              className="h-full bg-ink rounded-[2px]"
              animate={{ width: `${((progressStep - 1) / 4) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="absolute top-[62px] left-7 right-7 flex justify-between items-center z-[51]">
            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={back}
              className={`bg-transparent border-none text-[13px] text-dusk ${step > 4 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <svg width="16" height="12" fill="none">
                <path d="M6 1L1 6L6 11M1 6H15" stroke="#9E9485" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={next}
              className={`bg-transparent border-none text-[13px] text-dusk ${step < 7 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              Skip
            </motion.button>
          </div>
        </>
      )}

      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={step}
            custom={direction}
            variants={screenVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <CurrentScreen data={data} setData={setData} next={next} back={back} finish={finish} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
