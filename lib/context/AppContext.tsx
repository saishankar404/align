"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { differenceInDays, parseISO, startOfDay } from "date-fns";
import {
  db,
  type LocalCheckin,
  type LocalCycle,
  type LocalDirection,
  type LocalLaterItem,
  type LocalMove,
  type LocalProfile,
} from "@/lib/db/local";
import { requestSyncIfCloud } from "@/lib/db/sync";
import { supabase } from "@/lib/supabase/client";
import { todayStr } from "@/lib/utils/dates";
import { getActiveUserId, isCloudMode } from "@/lib/identity/client";
import { repairCycleSanity } from "@/lib/db/sanity";

export type SheetName =
  | "mark-done"
  | "showed-up"
  | "night-checkin"
  | "avoided"
  | "today-info"
  | "tips"
  | "add-move"
  | "add-later"
  | "directions"
  | "direction-detail"
  | "later-item"
  | "day-detail";

interface AppState {
  profile: LocalProfile | null;
  currentCycle: LocalCycle | null;
  allCycles: LocalCycle[];
  directions: LocalDirection[];
  todayMoves: LocalMove[];
  allMovesThisCycle: LocalMove[];
  allMoves: LocalMove[];
  todayCheckin: LocalCheckin | null;
  checkinsThisCycle: LocalCheckin[];
  allCheckins: LocalCheckin[];
  laterItems: LocalLaterItem[];
  allLaterItems: LocalLaterItem[];
  currentDay: number;
  daysRemaining: number;
  isLoading: boolean;
  userId: string | null;
  activeSheet: SheetName | null;
  sheetData: Record<string, unknown>;
}

interface AppContextValue extends AppState {
  refresh: () => Promise<void>;
  openSheet: (name: SheetName, data?: Record<string, unknown>) => void;
  closeSheet: () => void;
  openSheetChain: (name: SheetName, data?: Record<string, unknown>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const INITIAL_STATE: AppState = {
  profile: null,
  currentCycle: null,
  allCycles: [],
  directions: [],
  todayMoves: [],
  allMovesThisCycle: [],
  allMoves: [],
  todayCheckin: null,
  checkinsThisCycle: [],
  allCheckins: [],
  laterItems: [],
  allLaterItems: [],
  currentDay: 1,
  daysRemaining: 0,
  isLoading: true,
  userId: null,
  activeSheet: null,
  sheetData: {},
};

function toDateStr(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function buildDemoState(): AppState {
  const userId = "demo-user";
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 4);
  const end = new Date(start);
  end.setDate(end.getDate() + 13);

  const now = new Date().toISOString();
  const todayDate = toDateStr(today);
  const startDate = toDateStr(start);
  const endDate = toDateStr(end);

  const cycle: LocalCycle = {
    id: "cycle-demo-1",
    userId,
    startDate,
    endDate,
    lengthDays: 14,
    status: "active",
    createdAt: now,
    _synced: 0,
  };

  const directions: LocalDirection[] = [
    { id: "dir-1", cycleId: cycle.id, userId, title: "Landing page", color: "terra", position: 1, createdAt: now, _synced: 0 },
    { id: "dir-2", cycleId: cycle.id, userId, title: "Get fit", color: "forest", position: 2, createdAt: now, _synced: 0 },
    { id: "dir-3", cycleId: cycle.id, userId, title: "Find a client", color: "slate", position: 3, createdAt: now, _synced: 0 },
  ];

  const todayMoves: LocalMove[] = [
    {
      id: "move-1",
      cycleId: cycle.id,
      directionId: "dir-2",
      userId,
      title: "Morning run 5km",
      date: todayDate,
      status: "done",
      doneAt: now,
      createdAt: now,
      updatedAt: now,
      _synced: 0,
    },
    {
      id: "move-2",
      cycleId: cycle.id,
      directionId: "dir-1",
      userId,
      title: "Write the hero copy",
      date: todayDate,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      _synced: 0,
    },
  ];

  const checkinsThisCycle: LocalCheckin[] = [];
  for (let i = 0; i < 4; i += 1) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    checkinsThisCycle.push({
      id: `checkin-${i + 1}`,
      cycleId: cycle.id,
      userId,
      date: toDateStr(d),
      status: i === 2 ? "avoided" : "showed_up",
      createdAt: now,
      _synced: 0,
    });
  }

  const laterItems: LocalLaterItem[] = [
    { id: "later-1", userId, type: "link", content: "designsystems.com/guide", note: "read after this cycle", promoted: false, dropped: false, createdAt: now, _synced: 0 },
    { id: "later-2", userId, type: "idea", content: "Start a newsletter next cycle", promoted: false, dropped: false, createdAt: now, _synced: 0 },
    { id: "later-3", userId, type: "link", content: "framer.com/motion/docs", promoted: false, dropped: false, createdAt: now, _synced: 0 },
    { id: "later-4", userId, type: "idea", content: "Build referral loop experiment", promoted: false, dropped: false, createdAt: now, _synced: 0 },
  ];

  return {
    ...INITIAL_STATE,
    profile: {
      id: userId,
      name: "Sai",
      timezone: "Asia/Kolkata",
      notifMorningTime: "08:00",
      notifNightTime: "21:30",
      notifEnabled: true,
    },
    currentCycle: cycle,
    allCycles: [cycle],
    directions,
    todayMoves,
    allMovesThisCycle: todayMoves,
    allMoves: todayMoves,
    todayCheckin: null,
    checkinsThisCycle,
    allCheckins: checkinsThisCycle,
    laterItems,
    allLaterItems: laterItems,
    currentDay: 5,
    daysRemaining: 9,
    isLoading: false,
    userId,
    activeSheet: null,
    sheetData: {},
  };
}

const DEV_BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const loadAll = useCallback(async (userId: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    await repairCycleSanity(userId);

    const profile = await db.profiles.get(userId);
    const allCycles = (await db.cycles.where("userId").equals(userId).toArray()).sort((a, b) =>
      a.startDate.localeCompare(b.startDate)
    );
    const activeCycles = allCycles.filter((item) => item.status === "active");
    const cycle =
      activeCycles.sort((a, b) => {
        const byStart = b.startDate.localeCompare(a.startDate);
        if (byStart !== 0) return byStart;
        return b.createdAt.localeCompare(a.createdAt);
      })[0] ?? null;

    if (!cycle) {
      const [allMoves, allCheckins, allLater] = await Promise.all([
        db.moves.where("userId").equals(userId).toArray(),
        db.checkins.where("userId").equals(userId).toArray(),
        db.laterItems.where("userId").equals(userId).toArray(),
      ]);

      setState((prev) => ({
        ...prev,
        profile: profile ?? null,
        currentCycle: null,
        allCycles,
        directions: [],
        todayMoves: [],
        allMovesThisCycle: [],
        allMoves,
        todayCheckin: null,
        checkinsThisCycle: [],
        allCheckins,
        laterItems: [],
        allLaterItems: allLater,
        currentDay: 1,
        daysRemaining: 0,
        isLoading: false,
        userId,
      }));
      return;
    }

    const today = todayStr();

    const [directions, todayMoves, allMovesThisCycle, todayCheckin, checkinsThisCycle, laterItems, allLaterItems, allMoves, allCheckins] = await Promise.all([
      db.directions.where("cycleId").equals(cycle.id).sortBy("position"),
      db.moves.where("[userId+date]").equals([userId, today]).toArray(),
      db.moves.where("cycleId").equals(cycle.id).toArray(),
      db.checkins.where("[userId+date]").equals([userId, today]).first(),
      db.checkins.where("cycleId").equals(cycle.id).toArray(),
      db.laterItems.where("userId").equals(userId).filter((item) => !item.dropped && !item.promoted).toArray(),
      db.laterItems.where("userId").equals(userId).toArray(),
      db.moves.where("userId").equals(userId).toArray(),
      db.checkins.where("userId").equals(userId).toArray(),
    ]);

    const raw = differenceInDays(startOfDay(new Date()), startOfDay(parseISO(cycle.startDate))) + 1;
    const currentDay = Math.min(Math.max(1, raw), cycle.lengthDays);
    const daysRemaining = Math.max(0, cycle.lengthDays - currentDay);

    setState((prev) => ({
      ...prev,
      profile: profile ?? null,
      currentCycle: cycle,
      allCycles,
      directions,
      todayMoves,
      allMovesThisCycle,
      allMoves,
      todayCheckin: todayCheckin ?? null,
      checkinsThisCycle,
      allCheckins,
      laterItems,
      allLaterItems,
      currentDay,
      daysRemaining,
      isLoading: false,
      userId,
    }));

    if (navigator.onLine && isCloudMode()) {
      requestSyncIfCloud(userId);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!state.userId) return;
    await loadAll(state.userId);
  }, [loadAll, state.userId]);

  const openSheet = useCallback((name: SheetName, data?: Record<string, unknown>) => {
    setState((prev) => ({ ...prev, activeSheet: name, sheetData: data ?? {} }));
  }, []);

  const closeSheet = useCallback(() => {
    setState((prev) => ({ ...prev, activeSheet: null, sheetData: {} }));
  }, []);

  const openSheetChain = useCallback((name: SheetName, data?: Record<string, unknown>) => {
    setState((prev) => ({ ...prev, activeSheet: null }));
    window.setTimeout(() => {
      setState((prev) => ({ ...prev, sheetData: data ?? {}, activeSheet: name }));
    }, 220);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (typeof window !== "undefined" && new URL(window.location.href).searchParams.get("demo") === "1") {
        setState(buildDemoState());
        return;
      }

      const userId = await getActiveUserId();

      if (DEV_BYPASS_AUTH && !userId) {
        localStorage.setItem("align_dev_user_id", "dev-user");
      }

      if (DEV_BYPASS_AUTH && userId) {
        localStorage.setItem("align_dev_user_id", userId);
      }

      if (!userId) {
        setState((prev) => ({ ...prev, isLoading: false, userId: null }));
        return;
      }

      await loadAll(userId);
    };

    run().catch(() => {
      setState((prev) => ({ ...prev, isLoading: false }));
    });
  }, [loadAll]);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      refresh,
      openSheet,
      closeSheet,
      openSheetChain,
    }),
    [closeSheet, openSheet, openSheetChain, refresh, state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
