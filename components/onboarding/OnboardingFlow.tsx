"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import ArrowLeft01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft01Icon";
import { db, type LocalProfile } from "@/lib/db/local";
import { requestSyncIfCloud, syncAllIfCloud } from "@/lib/db/sync";
import { supabase } from "@/lib/supabase/client";
import { newId } from "@/lib/utils/ids";
import {
  getActiveUserId,
  getCloudUserId,
  isCloudMode,
  setModeLocal,
  setModeCloud,
} from "@/lib/identity/client";
import { createNewCycle } from "@/lib/cycle/create";
import Welcome from "./screens/Welcome";
import SyncChoiceScreen from "./screens/SyncChoiceScreen";
import StoryProblem from "./screens/StoryProblem";
import StoryFix from "./screens/StoryFix";
import StoryHowItWorks from "./screens/StoryHowItWorks";
import NameScreen from "./screens/NameScreen";
import DirectionsScreen from "./screens/DirectionsScreen";
import CycleScreen from "./screens/CycleScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import DoneScreen from "./screens/DoneScreen";
import AnimatedAutoSize from "@/components/shared/AnimatedAutoSize";
import {
  ENTER_TRANSITION,
  EXIT_TRANSITION,
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_SPRING,
  TAP_SCALE,
  VIEW_TRANSITION,
} from "@/lib/motion/tokens";

export type OnboardingData = {
  name: string;
  age: string;
  directions: [string, string, string];
  cycleLength: 7 | 14;
  notifEnabled: boolean;
  notifMorningTime: string;
  notifNightTime: string;
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
  startAuth: (intent?: "existing" | "signup") => Promise<void>;
  chooseLocal: () => void;
};

type LinkState = {
  status: "idle" | "checking" | "conflict" | "merging" | "error";
  mode?: "link" | "signup";
  resolution?: "use_cloud" | "make_new";
  cloudUserId?: string;
  localUserId?: string;
  message?: string;
};

const LINK_PENDING_LOCAL_USER_ID_KEY = "align_link_local_user_id";
const FIRST_STORY_STEP = 2;

function createInitialOnboardingData(): OnboardingData {
  return {
    name: "",
    age: "",
    directions: ["", "", ""],
    cycleLength: 14,
    notifEnabled: false,
    notifMorningTime: "08:00",
    notifNightTime: "21:30",
    isSaving: false,
    saveError: null,
    nameError: null,
    directionsError: null,
  };
}

const screenVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-35%",
    transition: ENTER_TRANSITION,
  }),
  center: {
    x: 0,
    transition: VIEW_TRANSITION,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-12%" : "100%",
    transition: EXIT_TRANSITION,
  }),
};

const DEV_BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

async function hasAnyLocalData(userId: string): Promise<boolean> {
  const [profile, cycle, direction, move, checkin, later, reflection] = await Promise.all([
    db.profiles.get(userId),
    db.cycles.where("userId").equals(userId).first(),
    db.directions.where("userId").equals(userId).first(),
    db.moves.where("userId").equals(userId).first(),
    db.checkins.where("userId").equals(userId).first(),
    db.laterItems.where("userId").equals(userId).first(),
    db.reflections.where("userId").equals(userId).first(),
  ]);

  return Boolean(profile || cycle || direction || move || checkin || later || reflection);
}

async function hasAnyRemoteData(userId: string): Promise<boolean> {
  const [{ data: profile }, { count: cycleCount }, { count: directionCount }, { count: moveCount }] = await Promise.all([
    supabase.from("profiles").select("id").eq("id", userId).maybeSingle(),
    supabase.from("cycles").select("id", { head: true, count: "exact" }).eq("user_id", userId),
    supabase.from("directions").select("id", { head: true, count: "exact" }).eq("user_id", userId),
    supabase.from("moves").select("id", { head: true, count: "exact" }).eq("user_id", userId),
  ]);

  return Boolean(profile || (cycleCount ?? 0) > 0 || (directionCount ?? 0) > 0 || (moveCount ?? 0) > 0);
}

async function clearRemoteUserData(userId: string): Promise<void> {
  await Promise.all([
    supabase.from("reflections").delete().eq("user_id", userId),
    supabase.from("checkins").delete().eq("user_id", userId),
    supabase.from("moves").delete().eq("user_id", userId),
    supabase.from("directions").delete().eq("user_id", userId),
    supabase.from("cycles").delete().eq("user_id", userId),
    supabase.from("later_items").delete().eq("user_id", userId),
    supabase.from("profiles").delete().eq("id", userId),
  ]);
}

async function clearLocalUserData(userId: string): Promise<void> {
  await db.transaction("rw", db.tables, async () => {
    await db.profiles.delete(userId);
    const [cycles, directions, moves, checkins, laterItems, reflections, pendingDeletes] = await Promise.all([
      db.cycles.where("userId").equals(userId).toArray(),
      db.directions.where("userId").equals(userId).toArray(),
      db.moves.where("userId").equals(userId).toArray(),
      db.checkins.where("userId").equals(userId).toArray(),
      db.laterItems.where("userId").equals(userId).toArray(),
      db.reflections.where("userId").equals(userId).toArray(),
      db.pendingDeletes.where("userId").equals(userId).toArray(),
    ]);

    await Promise.all(cycles.map((row) => db.cycles.delete(row.id)));
    await Promise.all(directions.map((row) => db.directions.delete(row.id)));
    await Promise.all(moves.map((row) => db.moves.delete(row.id)));
    await Promise.all(checkins.map((row) => db.checkins.delete(row.id)));
    await Promise.all(laterItems.map((row) => db.laterItems.delete(row.id)));
    await Promise.all(reflections.map((row) => db.reflections.delete(row.id)));
    await Promise.all(pendingDeletes.map((row) => db.pendingDeletes.delete(row.key)));
  });
}

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [linkState, setLinkState] = useState<LinkState>({ status: "idle" });
  const [showFreshStartWarning, setShowFreshStartWarning] = useState(false);
  const [data, setData] = useState<OnboardingData>(createInitialOnboardingData);

  const steps = useMemo(
    () => [
      Welcome,
      SyncChoiceScreen,
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

  useEffect(() => {
    if (linkState.status === "conflict" && linkState.mode === "signup") return;
    setShowFreshStartWarning(false);
  }, [linkState.mode, linkState.status]);

  const completeLinkWithLocal = async (localUserId: string, cloudUserId: string) => {
    setLinkState({ status: "merging", localUserId, cloudUserId, message: "Moving this device data to your account..." });

    await clearRemoteUserData(cloudUserId);

    await db.transaction(
      "rw",
      db.tables,
      async () => {
        await db.profiles.delete(cloudUserId);
        const localProfile = await db.profiles.get(localUserId);
        if (localProfile) {
          const nextProfile: LocalProfile = {
            ...localProfile,
            id: cloudUserId,
          };
          await db.profiles.put(nextProfile);
          await db.profiles.delete(localUserId);
        }

        const cloudCycles = await db.cycles.where("userId").equals(cloudUserId).toArray();
        await Promise.all(cloudCycles.map((row) => db.cycles.delete(row.id)));
        const localCycles = await db.cycles.where("userId").equals(localUserId).toArray();
        await Promise.all(
          localCycles.map((row) => db.cycles.put({ ...row, userId: cloudUserId, _synced: 0 }))
        );

        const cloudDirections = await db.directions.where("userId").equals(cloudUserId).toArray();
        await Promise.all(cloudDirections.map((row) => db.directions.delete(row.id)));
        const localDirections = await db.directions.where("userId").equals(localUserId).toArray();
        await Promise.all(
          localDirections.map((row) => db.directions.put({ ...row, userId: cloudUserId, _synced: 0 }))
        );

        const cloudMoves = await db.moves.where("userId").equals(cloudUserId).toArray();
        await Promise.all(cloudMoves.map((row) => db.moves.delete(row.id)));
        const localMoves = await db.moves.where("userId").equals(localUserId).toArray();
        await Promise.all(
          localMoves.map((row) => db.moves.put({ ...row, userId: cloudUserId, _synced: 0 }))
        );

        const cloudCheckins = await db.checkins.where("userId").equals(cloudUserId).toArray();
        await Promise.all(cloudCheckins.map((row) => db.checkins.delete(row.id)));
        const localCheckins = await db.checkins.where("userId").equals(localUserId).toArray();
        await Promise.all(
          localCheckins.map((row) => db.checkins.put({ ...row, userId: cloudUserId, _synced: 0 }))
        );

        const cloudLater = await db.laterItems.where("userId").equals(cloudUserId).toArray();
        await Promise.all(cloudLater.map((row) => db.laterItems.delete(row.id)));
        const localLater = await db.laterItems.where("userId").equals(localUserId).toArray();
        await Promise.all(
          localLater.map((row) => db.laterItems.put({ ...row, userId: cloudUserId, _synced: 0 }))
        );

        const cloudReflections = await db.reflections.where("userId").equals(cloudUserId).toArray();
        await Promise.all(cloudReflections.map((row) => db.reflections.delete(row.id)));
        const localReflections = await db.reflections.where("userId").equals(localUserId).toArray();
        await Promise.all(
          localReflections.map((row) => db.reflections.put({ ...row, userId: cloudUserId, _synced: 0 }))
        );
      }
    );

    setModeCloud(cloudUserId);
    localStorage.removeItem(LINK_PENDING_LOCAL_USER_ID_KEY);
    await syncAllIfCloud(cloudUserId);
    router.push("/home");
  };

  const completeLinkWithCloud = async (localUserId: string, cloudUserId: string) => {
    setLinkState({ status: "merging", localUserId, cloudUserId, message: "Switching this device to cloud data..." });
    await clearLocalUserData(localUserId);

    setModeCloud(cloudUserId);
    localStorage.removeItem(LINK_PENDING_LOCAL_USER_ID_KEY);
    await syncAllIfCloud(cloudUserId);
    router.push("/home");
  };

  const cleanupAuthQueryParams = () => {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("afterAuth");
    cleanUrl.searchParams.delete("code");
    cleanUrl.searchParams.delete("authError");
    cleanUrl.searchParams.delete("authErrorCode");
    cleanUrl.searchParams.delete("authErrorDescription");
    cleanUrl.searchParams.delete("intent");
    window.history.replaceState({}, "", `${cleanUrl.pathname}${cleanUrl.search}`);
  };

  const adoptCloudAccountData = async (cloudUserId: string) => {
    setLinkState({
      status: "merging",
      mode: "signup",
      resolution: "use_cloud",
      cloudUserId,
      message: "Using your existing cloud window...",
    });
    setModeCloud(cloudUserId);
    localStorage.removeItem(LINK_PENDING_LOCAL_USER_ID_KEY);
    setShowFreshStartWarning(false);
    cleanupAuthQueryParams();
    await syncAllIfCloud(cloudUserId);
    router.push("/home");
  };

  const startFreshWithCloudAccount = async (cloudUserId: string) => {
    setLinkState({
      status: "merging",
      mode: "signup",
      resolution: "make_new",
      cloudUserId,
      message: "Resetting your existing cloud window...",
    });

    await clearRemoteUserData(cloudUserId);
    await clearLocalUserData(cloudUserId);
    setModeCloud(cloudUserId);
    localStorage.removeItem(LINK_PENDING_LOCAL_USER_ID_KEY);
    setShowFreshStartWarning(false);
    setData(createInitialOnboardingData());
    setDirection(1);
    setStep(FIRST_STORY_STEP);
    setLinkState({ status: "idle" });
    cleanupAuthQueryParams();
  };

  const handleSignedInIntent = async (cloudUserId: string, intent: string | null): Promise<void> => {
    if (intent === "link") {
      const localUserId = localStorage.getItem(LINK_PENDING_LOCAL_USER_ID_KEY);
      if (!localUserId || localUserId === cloudUserId) {
        setModeCloud(cloudUserId);
        cleanupAuthQueryParams();
        router.push("/home");
        return;
      }

      setLinkState({
        status: "checking",
        mode: "link",
        localUserId,
        cloudUserId,
        message: "Checking local and cloud data...",
      });
      const [localHasData, remoteHasData] = await Promise.all([
        hasAnyLocalData(localUserId),
        hasAnyRemoteData(cloudUserId),
      ]);

      if (localHasData && remoteHasData) {
        setLinkState({
          status: "conflict",
          mode: "link",
          localUserId,
          cloudUserId,
          message: "Both local and cloud data exist. Choose what to keep.",
        });
        return;
      }

      if (localHasData) {
        await completeLinkWithLocal(localUserId, cloudUserId);
        return;
      }

      await completeLinkWithCloud(localUserId, cloudUserId);
      return;
    }

    if (intent === "signup") {
      setLinkState({
        status: "checking",
        mode: "signup",
        cloudUserId,
        message: "Checking if this account already has a window...",
      });
      const remoteHasData = await hasAnyRemoteData(cloudUserId);
      if (remoteHasData) {
        setLinkState({
          status: "conflict",
          mode: "signup",
          cloudUserId,
          message:
            "This Google account already has data. Use the existing cloud window or make a fresh one.",
        });
        return;
      }
      setLinkState({ status: "idle" });
    }

    if (intent === "existing") {
      const remoteHasData = await hasAnyRemoteData(cloudUserId);
      if (remoteHasData) {
        await adoptCloudAccountData(cloudUserId);
        return;
      }
    }

    setModeCloud(cloudUserId);
    setData((prev) => ({ ...prev, saveError: null }));
    setStep((prev) => (prev < FIRST_STORY_STEP ? FIRST_STORY_STEP : prev));
    cleanupAuthQueryParams();
  };

  useEffect(() => {
    const run = async () => {
      const params = new URL(window.location.href).searchParams;
      const hasCode = !!params.get("code");
      const afterAuth = params.get("afterAuth") === "1";
      const authError = params.get("authError");
      const intent = params.get("intent");

      if (authError) {
        setData((prev) => ({ ...prev, saveError: "Sign-in failed. Please try again." }));
      }

      const cloudUserId = await getCloudUserId();
      if (cloudUserId) {
        await handleSignedInIntent(cloudUserId, intent);
        return;
      }

      if (hasCode || afterAuth) {
        for (let i = 0; i < 20; i += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 250));
          const nextCloudUserId = await getCloudUserId();
          if (nextCloudUserId) {
            await handleSignedInIntent(nextCloudUserId, intent);
            return;
          }
        }

        if (hasCode) {
          setData((prev) => ({ ...prev, saveError: "Sign-in failed. Please try again." }));
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setModeCloud(session.user.id);
      }
    });

    run().catch(() => {
      setLinkState((prev) => ({
        ...prev,
        status: prev.status === "idle" ? "idle" : "error",
        message: "Could not finish sign-in. Try again.",
      }));
      setData((prev) => ({ ...prev, saveError: "Sign-in failed. Please try again." }));
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const next = () => {
    if (step === 5) {
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

    if (step === 6) {
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

  const chooseLocal = () => {
    setModeLocal();
    setDirection(1);
    setStep(FIRST_STORY_STEP);
  };

  const back = () => {
    if (step > 0 && step < 9) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const finish = async () => {
    setData((prev) => ({ ...prev, isSaving: true, saveError: null }));
    let persisted = false;

    try {
      let userId = await getActiveUserId();
      if (!userId) {
        userId = setModeLocal();
      }

      if (DEV_BYPASS_AUTH && !userId) {
        userId = localStorage.getItem("align_dev_user_id") ?? newId();
        localStorage.setItem("align_dev_user_id", userId);
      }

      if (!userId) {
        throw new Error("No active identity");
      }

      const now = new Date().toISOString();
      await db.profiles.put({
        id: userId,
        name: data.name.trim(),
        age: data.age ? Number.parseInt(data.age, 10) : undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifEnabled: data.notifEnabled,
        notifMorningTime: data.notifMorningTime,
        notifNightTime: data.notifNightTime,
        pushSubscription: localStorage.getItem("align_push_sub") ?? undefined,
      });

      await createNewCycle(userId, data.directions, data.cycleLength);

      localStorage.setItem("align_onboarded", "true");
      if (isCloudMode()) {
        requestSyncIfCloud(userId);
      }
      persisted = true;
    } catch {
      setData((prev) => ({
        ...prev,
        isSaving: false,
        saveError: "Something went wrong. Try again.",
      }));
    }

    if (persisted) {
      router.push("/home");
    }
  };

  const startAuth = async (intent: "existing" | "signup" = "existing") => {
    if (DEV_BYPASS_AUTH) {
      setModeLocal();
      next();
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=onboarding&intent=${intent}`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setData((prev) => ({ ...prev, saveError: "Couldn't start Google sign-in. Try again." }));
    }
  };

  const showTopUI = step >= 1 && step <= 8;
  const showProgress = step >= 5 && step <= 8;
  const progressStep = step - 4;
  const darkTop = step === 1 || step === 2 || step === 8;
  const topTextColor = darkTop ? "text-white/45" : "text-dusk";
  const topStrokeColor = darkTop ? "#E8E2D9" : "#9E9485";

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-parchment">
      {linkState.status !== "idle" ? (
        <div className="absolute inset-0 z-[80] bg-ink px-8 pt-[60px] pb-[44px] flex flex-col">
          <div className="font-body text-[10px] font-medium tracking-[0.14em] uppercase text-white/40 mb-4">
            {linkState.mode === "signup" ? "Existing account" : "Link account"}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="font-gtw text-[52px] tracking-[-0.045em] leading-[0.95] text-parchment mb-4">
              {linkState.status === "conflict" ? "Choose what to keep." : "Linking your data."}
            </h1>
            <p className="font-body text-[15px] leading-[1.65] text-white/50 max-w-[310px]">
              {linkState.message ?? "Working on it..."}
            </p>
          </div>
          <AnimatedAutoSize className="w-full" transition={{ duration: MOTION_DURATION.smallState, ease: MOTION_EASE.easeInOut, delay: 0.05 }}>
            {linkState.status === "conflict" && linkState.mode === "link" && linkState.localUserId && linkState.cloudUserId ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    void completeLinkWithLocal(linkState.localUserId as string, linkState.cloudUserId as string);
                  }}
                  className="w-full rounded-full bg-slate text-ink py-[14px] font-gtw text-[14px] tracking-[0.02em]"
                >
                  Keep this device data
                </button>
                <button
                  onClick={() => {
                    void completeLinkWithCloud(linkState.localUserId as string, linkState.cloudUserId as string);
                  }}
                  className="w-full rounded-full bg-white/8 text-white py-[14px] font-gtw text-[14px] tracking-[0.02em]"
                >
                  Use cloud data
                </button>
              </div>
            ) : linkState.status === "conflict" && linkState.mode === "signup" && linkState.cloudUserId ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    void adoptCloudAccountData(linkState.cloudUserId as string);
                  }}
                  className="w-full rounded-full bg-slate text-ink py-[14px] font-gtw text-[14px] tracking-[0.02em]"
                >
                  Use cloud data
                </button>
                <button
                  onClick={() => setShowFreshStartWarning(true)}
                  className="w-full rounded-full bg-white/8 text-white py-[14px] font-gtw text-[14px] tracking-[0.02em]"
                >
                  Make new one anyway
                </button>
              </div>
            ) : (
              <div className="font-body text-[13px] text-white/35">Please wait...</div>
            )}
          </AnimatedAutoSize>

          {showFreshStartWarning && linkState.mode === "signup" && linkState.cloudUserId ? (
            <div className="absolute inset-0 z-[81] bg-black/55 flex items-end px-4 pb-[calc(var(--sab)+14px)]">
              <div className="w-full rounded-[20px] bg-parchment border border-border p-5">
                <div className="font-body text-[9px] font-medium tracking-[0.1em] uppercase text-terra mb-1">Heads up</div>
                <div className="font-gtw text-[30px] tracking-[-0.03em] text-ink leading-[1.03] mb-2">
                  Start fresh on this account?
                </div>
                <p className="font-body text-[13px] leading-[1.6] text-dusk mb-4">
                  This will reset existing cloud data for this account and replace it with your new onboarding setup on this device.
                </p>
                <button
                  onClick={() => {
                    void startFreshWithCloudAccount(linkState.cloudUserId as string);
                  }}
                  className="w-full rounded-full py-3 font-gtw text-[13px] mb-2 bg-terra text-ink"
                >
                  Yes, make this the new primary
                </button>
                <button
                  onClick={() => setShowFreshStartWarning(false)}
                  className="w-full py-2 text-[12px] text-dusk min-hit-target touch-hit-area"
                >
                  Go back
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {showTopUI && (
        <>
          {showProgress ? (
            <div className="absolute top-[calc(var(--sat)+12px)] left-8 right-8 h-[2px] bg-ink/10 rounded-[2px] z-50">
              <motion.div
                className="h-full bg-ink rounded-[2px]"
                animate={{ width: `${((progressStep - 1) / 4) * 100}%` }}
                transition={{ duration: MOTION_DURATION.smallState, ease: MOTION_EASE.linear }}
              />
            </div>
          ) : null}

          <div className="absolute top-[calc(var(--sat)+18px)] left-7 right-7 z-[51]">
            <div className="grid grid-cols-[44px_1fr_72px] items-center">
            <motion.button
              whileTap={{ scale: TAP_SCALE.default }}
              transition={MOTION_SPRING.press}
              onClick={back}
              className={`h-11 w-11 flex items-center justify-start bg-transparent border-none text-[13px] min-hit-target touch-hit-area ${topTextColor} ${step > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color={topStrokeColor} strokeWidth={2} />
            </motion.button>

            <div />

            <motion.button
              whileTap={{ scale: TAP_SCALE.default }}
              transition={MOTION_SPRING.press}
              onClick={next}
              className={`h-11 min-hit-target touch-hit-area justify-self-end bg-transparent border-none text-[13px] ${topTextColor} ${
                step < 8 && step !== 5 ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              Skip
            </motion.button>
            </div>
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
            <CurrentScreen
              data={data}
              setData={setData}
              next={next}
              back={back}
              finish={finish}
              startAuth={startAuth}
              chooseLocal={chooseLocal}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
