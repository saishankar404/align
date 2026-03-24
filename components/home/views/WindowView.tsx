"use client";

import { addDays, format, isBefore, isToday, parseISO, startOfDay } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import ActivitySparkIcon from "@hugeicons/core-free-icons/dist/esm/ActivitySparkIcon";
import AiIdeaIcon from "@hugeicons/core-free-icons/dist/esm/AiIdeaIcon";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowUpRight01Icon";
import CalendarLove01Icon from "@hugeicons/core-free-icons/dist/esm/CalendarLove01Icon";
import ClockCheckIcon from "@hugeicons/core-free-icons/dist/esm/ClockCheckIcon";
import Dumbbell01Icon from "@hugeicons/core-free-icons/dist/esm/Dumbbell01Icon";
import { useLenis } from "@/hooks/useLenis";
import { useAppContext } from "@/lib/context/AppContext";

const calColors = ["#D6CDE8", "#C8DBBF", "#D9C9B8", "#C5D4D4", "#D4C0C0"];

const futureMotivation = [
  { text: "Keep showing up. This day opens soon.", icon: ActivitySparkIcon },
  { text: "Small reps stack. Your future self is waiting.", icon: Dumbbell01Icon },
  { text: "You are building momentum one day at a time.", icon: ArrowUpRight01Icon },
  { text: "Stay consistent. This slot will become real.", icon: ClockCheckIcon },
  { text: "Your next move is already taking shape.", icon: AiIdeaIcon },
  { text: "Keep the streak warm. Tomorrow gets brighter.", icon: CalendarLove01Icon },
] as const;

type WindowRow = {
  id: string;
  kind: "real" | "future";
  date: Date;
  dateStr: string;
  monthKey: string;
  weekday: string;
  dateNum: string;
  monthLabel: string;
  isToday: boolean;
  isPast: boolean;
  moves: ReturnType<typeof useAppContext>["allMoves"];
  checkin: ReturnType<typeof useAppContext>["allCheckins"][number] | null;
  color: string;
};

function dateHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 1_000_000_007;
  }
  return hash;
}

function colorForDate(dateStr: string): string {
  return calColors[dateHash(dateStr) % calColors.length];
}

export default function WindowView() {
  const context = useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const monthRailRef = useRef<HTMLDivElement>(null);
  const monthItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const didInitMonthRail = useRef(false);
  useLenis(scrollRef);

  const [activeMonthKey, setActiveMonthKey] = useState<string>(format(new Date(), "yyyy-MM"));
  const currentMonthKey = format(new Date(), "yyyy-MM");

  const rows = useMemo<WindowRow[]>(() => {
    const activeCycle = context.currentCycle;
    if (!activeCycle) return [];

    const movesByDate = new Map<string, typeof context.allMoves>();
    const checkinsByDate = new Map<string, (typeof context.allCheckins)[number]>();

    for (const move of context.allMoves) {
      const existing = movesByDate.get(move.date);
      if (existing) {
        existing.push(move);
      } else {
        movesByDate.set(move.date, [move]);
      }
    }

    for (const checkin of context.allCheckins) {
      checkinsByDate.set(checkin.date, checkin);
    }

    const rowByDate = new Map<string, WindowRow>();

    const cycles = [...context.allCycles].sort((a, b) => a.startDate.localeCompare(b.startDate));
    for (const cycle of cycles) {
      for (let dayOffset = 0; dayOffset < cycle.lengthDays; dayOffset += 1) {
        const date = addDays(parseISO(cycle.startDate), dayOffset);
        const dateStr = format(date, "yyyy-MM-dd");
        if (rowByDate.has(dateStr)) continue;
        rowByDate.set(dateStr, {
          id: `real-${dateStr}`,
          kind: "real",
          date,
          dateStr,
          monthKey: format(date, "yyyy-MM"),
          weekday: format(date, "EEE"),
          dateNum: format(date, "d"),
          monthLabel: format(date, "MMM"),
          isToday: isToday(date),
          isPast: isBefore(date, startOfDay(new Date())) && !isToday(date),
          moves: movesByDate.get(dateStr) ?? [],
          checkin: checkinsByDate.get(dateStr) ?? null,
          color: colorForDate(dateStr),
        });
      }
    }

    const futureRows: WindowRow[] = [];
    const futureStart = addDays(parseISO(activeCycle.endDate), 1);
    for (let dayOffset = 0; dayOffset < activeCycle.lengthDays; dayOffset += 1) {
      const date = addDays(futureStart, dayOffset);
      const dateStr = format(date, "yyyy-MM-dd");
      if (rowByDate.has(dateStr)) continue;
      futureRows.push({
        id: `future-${dateStr}`,
        kind: "future",
        date,
        dateStr,
        monthKey: format(date, "yyyy-MM"),
        weekday: format(date, "EEE"),
        dateNum: format(date, "d"),
        monthLabel: format(date, "MMM"),
        isToday: false,
        isPast: false,
        moves: [],
        checkin: null,
        color: "#E7E1D7",
      });
    }

    return [...Array.from(rowByDate.values()), ...futureRows].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [context.allCheckins, context.allCycles, context.allMoves, context.currentCycle]);

  const cycleStart = useMemo(
    () => (context.currentCycle ? startOfDay(parseISO(context.currentCycle.startDate)) : null),
    [context.currentCycle]
  );

  const isPreviousWindowDay = (date: Date) => {
    if (!cycleStart) return false;
    return isBefore(startOfDay(date), cycleStart);
  };

  const monthKind = (monthKey: string): "past" | "current" | "future" => {
    if (monthKey < currentMonthKey) return "past";
    if (monthKey > currentMonthKey) return "future";
    return "current";
  };

  const monthItems = useMemo(() => {
    const seen = new Set<string>();
    const result: { key: string; label: string }[] = [];
    for (const row of rows) {
      if (seen.has(row.monthKey)) continue;
      seen.add(row.monthKey);
      result.push({ key: row.monthKey, label: format(parseISO(`${row.monthKey}-01`), "MMM").toUpperCase() });
    }
    return result;
  }, [rows]);

  const visibleRows = useMemo(() => rows.filter((row) => row.monthKey === activeMonthKey), [activeMonthKey, rows]);

  useEffect(() => {
    if (!monthItems.length) return;

    const hasActive = monthItems.some((item) => item.key === activeMonthKey);
    const initialKey = monthItems.some((item) => item.key === currentMonthKey)
      ? currentMonthKey
      : monthItems[monthItems.length - 1]?.key;

    if (!initialKey) return;

    if (!hasActive) {
      setActiveMonthKey(initialKey);
    }

    const rail = monthRailRef.current;
    const targetKey = hasActive ? activeMonthKey : initialKey;
    const target = monthItemRefs.current[targetKey];
    if (!rail || !target) return;
    if (didInitMonthRail.current) return;

    const left = target.offsetLeft - (rail.clientWidth - target.clientWidth) / 2;
    rail.scrollTo({ left, behavior: "auto" });
    didInitMonthRail.current = true;
  }, [activeMonthKey, currentMonthKey, monthItems]);

  useEffect(() => {
    const rail = monthRailRef.current;
    if (!rail || !monthItems.length) return;

    let frame: number | null = null;

    const updateActiveFromCenter = () => {
      const railCenter = rail.scrollLeft + rail.clientWidth / 2;
      let closest = monthItems[0];
      let distance = Number.POSITIVE_INFINITY;

      for (const month of monthItems) {
        const node = monthItemRefs.current[month.key];
        if (!node) continue;
        const nodeCenter = node.offsetLeft + node.clientWidth / 2;
        const diff = Math.abs(nodeCenter - railCenter);
        if (diff < distance) {
          distance = diff;
          closest = month;
        }
      }

      setActiveMonthKey((prev) => (prev === closest.key ? prev : closest.key));
      frame = null;
    };

    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(updateActiveFromCenter);
    };

    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      rail.removeEventListener("scroll", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [monthItems]);

  const centerMonth = (monthKey: string) => {
    const rail = monthRailRef.current;
    const target = monthItemRefs.current[monthKey];
    if (!rail || !target) return;
    const left = target.offsetLeft - (rail.clientWidth - target.clientWidth) / 2;
    rail.scrollTo({ left, behavior: "smooth" });
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="pb-24">
        <div className="pt-5">
          <div ref={monthRailRef} className="flex items-center gap-1 px-7 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none">
            {monthItems.map((month) => {
              const active = month.key === activeMonthKey;
              const kind = monthKind(month.key);
              const inactiveClass =
                kind === "past"
                  ? "text-[22px] text-dusk opacity-25"
                  : "text-[22px] text-dusk opacity-45";
              return (
                <button
                  key={month.key}
                  ref={(node) => {
                    monthItemRefs.current[month.key] = node;
                  }}
                  onClick={() => {
                    setActiveMonthKey(month.key);
                    centerMonth(month.key);
                  }}
                  className="shrink-0 snap-center py-1 px-5"
                >
                  <div className={`font-gtw tracking-[-0.02em] transition-all duration-200 ${active ? "text-[40px] text-ink opacity-100" : inactiveClass}`}>
                    {month.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-[14px] px-7 flex flex-col gap-[10px]">
          {visibleRows.map((row) => {
            if (row.kind === "future") {
              const variant = futureMotivation[dateHash(row.dateStr) % futureMotivation.length];
              return (
                <div key={row.id} className="rounded-[20px] p-5 border border-border/70 bg-[#E7E1D7] text-ink text-left">
                  <div className="flex items-start justify-between gap-[10px]">
                    <div>
                      <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase mb-1 opacity-50">{row.weekday}</div>
                      <div className="font-gtw text-[52px] font-light tracking-[-0.05em] leading-[0.9]">{row.dateNum.padStart(2, "0")}</div>
                      <div className="font-gtw text-[13px] font-light tracking-[-0.01em] opacity-55 mt-[2px]">{row.monthLabel.toUpperCase()}</div>
                    </div>
                    <div className="flex-1 min-w-0 pl-3 pt-1">
                      <div className="inline-flex items-center gap-[6px] rounded-full px-3 py-[5px] bg-black/5 mb-[10px]">
                        <HugeiconsIcon icon={variant.icon} size={14} color="#1A1A1A" strokeWidth={1.8} />
                        <span className="font-body text-[9px] font-medium uppercase tracking-[0.1em] text-ink/60">Coming up</span>
                      </div>
                      <div className="font-gtw text-[14px] tracking-[-0.01em] leading-[1.2] text-ink/80">{variant.text}</div>
                    </div>
                  </div>
                </div>
              );
            }

            const previousWindowDay = row.kind === "real" && isPreviousWindowDay(row.date);

            return (
              <button key={row.id} onClick={() => context.openSheet("day-detail", { date: row.dateStr })} className="rounded-[20px] p-5 text-ink text-left" style={{ background: row.color }}>
                <div className={`flex items-start justify-between gap-[10px] ${previousWindowDay ? "opacity-45 grayscale-[20%]" : ""}`}>
                  <div>
                    <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase mb-1 opacity-50">{row.weekday}</div>
                    {row.isToday ? <div className="font-body text-[8px] font-medium tracking-[0.1em] uppercase bg-black/15 px-2 py-[3px] rounded-full inline-block mb-[6px]">Today</div> : null}
                    <div className="font-gtw text-[52px] font-light tracking-[-0.05em] leading-[0.9]">{row.dateNum.padStart(2, "0")}</div>
                    <div className="font-gtw text-[13px] font-light tracking-[-0.01em] opacity-55 mt-[2px]">{row.monthLabel.toUpperCase()}</div>
                  </div>

                  <div className="flex flex-col gap-[6px] items-end pt-1 min-w-0">
                    {row.moves.slice(0, 2).map((move) => (
                      <div key={move.id} className="font-gtw text-[12px] tracking-[-0.01em] px-3 py-[6px] rounded-full bg-black/10 max-w-[140px] truncate">{move.title}</div>
                    ))}
                    {row.moves.length > 2 ? <div className="font-body text-[9px] uppercase tracking-[0.08em] opacity-50">+ {row.moves.length - 2} more</div> : null}
                    {row.isPast && row.checkin ? <span className={`w-[8px] h-[8px] rounded-full ${row.checkin.status === "showed_up" ? "bg-forest" : "bg-terra"}`} /> : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
