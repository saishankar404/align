"use client";

import { addDays, format, isBefore, isToday, parseISO, startOfDay } from "date-fns";
import { useMemo, useRef } from "react";
import { useLenis } from "@/hooks/useLenis";
import { useAppContext } from "@/lib/context/AppContext";

const calColors = ["#D6CDE8", "#C8DBBF", "#D9C9B8", "#C5D4D4", "#D4C0C0"];

export default function WindowView() {
  const context = useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  useLenis(scrollRef);

  const cycle = context.currentCycle;
  if (!cycle) return <div className="h-full" />;

  const rows = useMemo(() => {
    return Array.from({ length: cycle.lengthDays }, (_, index) => {
      const date = addDays(parseISO(cycle.startDate), index);
      const dateStr = format(date, "yyyy-MM-dd");
      return {
        dayNumber: index + 1,
        date,
        dateStr,
        weekday: format(date, "EEE"),
        dateNum: format(date, "d"),
        monthLabel: format(date, "MMM"),
        isToday: isToday(date),
        isPast: isBefore(date, startOfDay(new Date())) && !isToday(date),
        moves: context.allMovesThisCycle.filter((move) => move.date === dateStr),
        checkin: context.checkinsThisCycle.find((checkin) => checkin.date === dateStr) ?? null,
        color: calColors[index % 5],
      };
    });
  }, [context.allMovesThisCycle, context.checkinsThisCycle, cycle.lengthDays, cycle.startDate]);

  const months = [
    format(addDays(parseISO(cycle.startDate), -15), "MMM"),
    format(parseISO(cycle.startDate), "MMM"),
    format(addDays(parseISO(cycle.startDate), 30), "MMM"),
  ];

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="pb-24">
        <div className="pt-5 overflow-hidden">
          <div className="flex px-7 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {months.map((month, index) => (
              <div key={`${month}-${index}`} className="shrink-0 py-1 px-5 snap-center">
                <div className={`font-gtw tracking-[-0.02em] ${index === 1 ? "text-[40px] text-ink opacity-100" : "text-[22px] text-dusk opacity-35"}`}>{month.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-[14px] px-7 flex flex-col gap-[10px]">
          {rows.map((row) => (
            <button key={row.dateStr} onClick={() => context.openSheet("day-detail", { date: row.dateStr })} className="rounded-[20px] p-5 text-ink text-left" style={{ background: row.color }}>
              <div className="flex items-start justify-between gap-[10px]">
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
                  {row.isPast && row.checkin ? (
                    <span className={`w-[8px] h-[8px] rounded-full ${row.checkin.status === "showed_up" ? "bg-forest" : "bg-terra"}`} />
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
