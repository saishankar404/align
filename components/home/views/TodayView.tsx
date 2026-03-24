"use client";

import { format, parseISO } from "date-fns";
import { useMemo, useRef } from "react";
import DotRow from "@/components/home/shared/DotRow";
import InfoCard from "@/components/home/shared/InfoCard";
import MoveCard from "@/components/home/shared/MoveCard";
import SectionHeader from "@/components/home/shared/SectionHeader";
import { useAppContext } from "@/lib/context/AppContext";
import { useLenis } from "@/hooks/useLenis";
import { db } from "@/lib/db/local";
import { syncAll } from "@/lib/db/sync";

const dirColorClass = {
  terra: "bg-terra",
  forest: "bg-forest",
  slate: "bg-slate",
} as const;

interface TodayViewProps {
  onOpenLaterTab: () => void;
}

export default function TodayView({ onOpenLaterTab }: TodayViewProps) {
  const context = useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  useLenis(scrollRef);

  const resultCard = useMemo(() => {
    if (!context.todayCheckin) return null;
    if (context.todayCheckin.status === "showed_up") {
      return { title: "You showed up today.", tone: "bg-forest text-ink" };
    }
    return { title: "You marked today as avoided.", tone: "bg-sand text-ink" };
  }, [context.todayCheckin]);

  const cycle = context.currentCycle;
  if (!cycle) return <div className="h-full" />;

  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  const done = context.todayMoves.filter((move) => move.status === "done").length;
  const total = context.todayMoves.length;
  const remaining = total - done;

  const infoTitle =
    total === 0
      ? "No moves yet. What are you doing today?"
      : remaining === 0
        ? "Window's full. You showed up."
        : `${remaining} move${remaining > 1 ? "s" : ""} left. ${["", "Let's get moving.", "You're moving forward.", "Almost there."][done] ?? ""}`;

  const infoSub = `${done} of ${total} done today. Day ${context.currentDay} of ${cycle.lengthDays}.`;
  const progress = `${((context.currentDay / cycle.lengthDays) * 100).toFixed(1)}%`;
  const dayLabel = `Day ${context.currentDay} of ${cycle.lengthDays} · ${format(parseISO(cycle.startDate), "MMM d")} – ${format(parseISO(cycle.endDate), "MMM d")}`;

  const sortedLater = [...context.laterItems].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const peekLater = sortedLater.slice(0, 3);

  const toggleDoneToPending = async (moveId: string) => {
    if (!context.userId) return;
    const now = new Date().toISOString();
    await db.moves.update(moveId, { status: "pending", doneAt: undefined, updatedAt: now, _synced: 0 });
    await context.refresh();
    syncAll(context.userId).catch(() => undefined);
  };

  const showNightCTA = new Date().getHours() >= 18 && !context.todayCheckin;

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="px-7 pb-24">
        <div className="pt-[22px] flex justify-between items-end">
          <div>
            <div className="font-body text-[10px] font-medium tracking-[0.12em] uppercase text-dusk mb-[6px]">{greeting}</div>
            <div className="font-gtw text-[52px] font-normal tracking-[-0.04em] leading-[0.9] text-ink">{context.profile?.name ?? ""}</div>
          </div>
          <div className="flex flex-col items-end gap-2 pb-1">
            <div className="font-gtw text-[84px] font-light tracking-[-0.06em] leading-[0.9] text-ink opacity-[.07]">{String(context.currentDay).padStart(2, "0")}</div>
            <DotRow currentDay={context.currentDay} lengthDays={cycle.lengthDays} />
          </div>
        </div>

        <InfoCard title={infoTitle} subtitle={infoSub} dayLabel={dayLabel} progress={progress} onClick={() => context.openSheet("today-info")} />

        <SectionHeader label="Today" title="Moves" count={`${done}/${total}`} paddingTop={28} />

        <div className="pt-[10px] flex flex-col gap-[10px]">
          {context.todayMoves.map((move, index) => {
            const direction = context.directions.find((item) => item.id === move.directionId);
            return (
              <MoveCard
                key={move.id}
                move={move}
                direction={direction}
                tone={index % 2 === 0 ? "warm" : "sage"}
                onCardTap={() => {
                  if (move.status === "pending") {
                    context.openSheet("mark-done", { move });
                  }
                }}
                onCheckTap={() => {
                  if (move.status === "pending") {
                    context.openSheet("mark-done", { move });
                    return;
                  }
                  void toggleDoneToPending(move.id);
                }}
              />
            );
          })}
        </div>

        {context.todayMoves.length < 3 ? (
          <button onClick={() => context.openSheet("add-move")} className="flex items-center gap-[10px] pt-3 text-left">
            <span className="w-[22px] h-[22px] rounded-full border-[1.5px] border-dashed border-bs flex items-center justify-center text-[15px] text-bs">+</span>
            <span className="font-body text-[13px] text-dusk">Add a third move</span>
          </button>
        ) : (
          <div className="pt-3 font-body text-[11px] text-dusk">3 moves in. window&apos;s full.</div>
        )}

        <SectionHeader label="This cycle" title="Directions" count={String(context.directions.length)} />
        <div>
          {context.directions.map((direction, index) => (
            <button
              key={direction.id}
              onClick={() => context.openSheet("direction-detail", { direction })}
              className={`w-full flex items-center py-[13px] ${index === 0 ? "" : ""}`}
            >
              <span className="font-gtw text-[11px] font-light text-dusk min-w-7 text-left">{String(direction.position).padStart(2, "0")}</span>
              <span className="font-gtw text-[20px] tracking-[-0.02em] text-ink flex-1 text-left leading-[1.1]">{direction.title}</span>
              <span className={`w-[7px] h-[7px] rounded-full ${dirColorClass[direction.color]}`} />
            </button>
          ))}
        </div>

        {sortedLater.length > 0 ? (
          <>
            <SectionHeader label="Not now" title="Later pile" count={String(sortedLater.length)} />
            <div>
              {peekLater.map((item) => (
                <button key={item.id} onClick={() => context.openSheet("later-item", { item })} className="w-full flex items-center gap-[10px] py-3">
                  <span className={`font-body text-[8px] font-medium tracking-[0.1em] uppercase text-parchment rounded-full px-2 py-[3px] ${item.type === "link" ? "bg-slate" : "bg-terra"}`}>
                    {item.type === "link" ? "Link" : "Idea"}
                  </span>
                  <span className="font-gtw text-[14px] tracking-[-0.01em] text-ink truncate">{item.content}</span>
                </button>
              ))}
              {sortedLater.length > 3 ? (
                <button onClick={onOpenLaterTab} className="pt-[10px] font-body text-[11px] text-dusk">+ {sortedLater.length - 3} more &nbsp;›</button>
              ) : null}
            </div>
          </>
        ) : null}

        {showNightCTA ? (
          <button onClick={() => context.openSheet("night-checkin")} className="w-full mt-5 bg-ink rounded-[18px] p-5 flex items-center justify-between">
            <div className="text-left">
              <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-white/30 mb-1">Tonight</div>
              <div className="font-gtw text-[20px] tracking-[-0.02em] leading-[1.2] text-parchment">Did you show up today?</div>
            </div>
            <span className="w-[38px] h-[38px] rounded-full bg-white/10 flex items-center justify-center text-white">→</span>
          </button>
        ) : resultCard ? (
          <div className={`w-full mt-5 rounded-[18px] p-5 ${resultCard.tone}`}>
            <div className="font-gtw text-[20px] tracking-[-0.02em] leading-[1.2]">{resultCard.title}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
