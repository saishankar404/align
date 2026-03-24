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
import {
  db,
  type LocalCheckin,
  type LocalCycle,
  type LocalDirection,
  type LocalLaterItem,
  type LocalMove,
  type LocalProfile,
} from "@/lib/db/local";
import { syncAll } from "@/lib/db/sync";
import { supabase } from "@/lib/supabase/client";
import { cycleDay, todayStr } from "@/lib/utils/dates";

export type SheetName =
  | "mark-done"
  | "showed-up"
  | "night-checkin"
  | "avoided"
  | "today-info"
  | "add-move"
  | "add-later"
  | "direction-detail"
  | "later-item"
  | "day-detail";

interface AppState {
  profile: LocalProfile | null;
  currentCycle: LocalCycle | null;
  directions: LocalDirection[];
  todayMoves: LocalMove[];
  allMovesThisCycle: LocalMove[];
  todayCheckin: LocalCheckin | null;
  checkinsThisCycle: LocalCheckin[];
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
  directions: [],
  todayMoves: [],
  allMovesThisCycle: [],
  todayCheckin: null,
  checkinsThisCycle: [],
  laterItems: [],
  allLaterItems: [],
  currentDay: 1,
  daysRemaining: 0,
  isLoading: true,
  userId: null,
  activeSheet: null,
  sheetData: {},
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const loadAll = useCallback(async (userId: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    const profile = await db.profiles.get(userId);
    const cycle = await db.cycles
      .where("status")
      .equals("active")
      .and((c) => c.userId === userId)
      .first();

    if (!cycle) {
      setState((prev) => ({
        ...prev,
        profile: profile ?? null,
        currentCycle: null,
        directions: [],
        todayMoves: [],
        allMovesThisCycle: [],
        todayCheckin: null,
        checkinsThisCycle: [],
        laterItems: [],
        allLaterItems: [],
        currentDay: 1,
        daysRemaining: 0,
        isLoading: false,
        userId,
      }));
      return;
    }

    const today = todayStr();

    const [directions, todayMoves, allMoves, todayCheckin, allCheckins, laterItems, allLater] = await Promise.all([
      db.directions.where("cycleId").equals(cycle.id).sortBy("position"),
      db.moves.where("[userId+date]").equals([userId, today]).toArray(),
      db.moves.where("cycleId").equals(cycle.id).toArray(),
      db.checkins.where("[userId+date]").equals([userId, today]).first(),
      db.checkins.where("cycleId").equals(cycle.id).toArray(),
      db.laterItems.where("userId").equals(userId).filter((item) => !item.dropped && !item.promoted).toArray(),
      db.laterItems.where("userId").equals(userId).toArray(),
    ]);

    const currentDay = Math.min(cycle.lengthDays, cycleDay(cycle.startDate));
    const daysRemaining = Math.max(0, cycle.lengthDays - currentDay);

    setState((prev) => ({
      ...prev,
      profile: profile ?? null,
      currentCycle: cycle,
      directions,
      todayMoves,
      allMovesThisCycle: allMoves,
      todayCheckin: todayCheckin ?? null,
      checkinsThisCycle: allCheckins,
      laterItems,
      allLaterItems: allLater,
      currentDay,
      daysRemaining,
      isLoading: false,
      userId,
    }));

    if (navigator.onLine) {
      syncAll(userId).catch(() => undefined);
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id ?? null;

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
