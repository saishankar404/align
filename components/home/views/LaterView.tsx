"use client";

import { useRef } from "react";
import { useLenis } from "@/hooks/useLenis";
import { useAppContext } from "@/lib/context/AppContext";

interface LaterViewProps {
  windowClosedReview?: boolean;
  onItemAction?: (itemId: string, action: "promote" | "drop") => void;
}

export default function LaterView({ windowClosedReview = false, onItemAction }: LaterViewProps) {
  const context = useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  useLenis(scrollRef);

  const links = context.laterItems.filter((item) => item.type === "link").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const ideas = context.laterItems.filter((item) => item.type === "idea").sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="pb-24">
        <div className="pt-7 px-7">
          <div className="font-gtw text-[48px] font-light tracking-[-0.04em] leading-[0.96] text-ink whitespace-nowrap">Later pile</div>
          <div className="font-body text-[12px] text-dusk leading-[1.6] mt-2">{context.laterItems.length} items. Not now, but not lost.</div>
        </div>

        {!windowClosedReview ? (
          <button onClick={() => context.openSheet("add-later")} className="mx-7 mt-4 w-[calc(100%-56px)] bg-ink rounded-full px-5 py-[14px] flex items-center justify-between">
            <span className="font-gtw text-[14px] text-parchment tracking-[-0.01em]">Add link or idea</span>
            <span className="w-7 h-7 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-base">+</span>
          </button>
        ) : null}

        {context.laterItems.length === 0 ? (
          <div className="px-7 pt-8">
            <div className="font-gtw text-[24px] tracking-[-0.03em] text-ink">Nothing here yet.</div>
            <p className="font-body text-[13px] text-dusk mt-2">Save ideas and links here so your current window stays focused.</p>
          </div>
        ) : (
          <div className="pt-5 px-7">
            {links.length > 0 ? <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-[10px]">Links</div> : null}
            <div className="flex flex-col gap-2 mb-5">
              {links.map((item) => (
                <div key={item.id} className="bg-sand rounded-[14px] p-4 text-left">
                  <div className="mb-[6px]"><span className="font-body text-[8px] font-medium tracking-[0.1em] uppercase px-2 py-[3px] rounded-full text-parchment bg-slate">Link</span></div>
                  {!windowClosedReview ? (
                    <button onClick={() => context.openSheet("later-item", { item })} className="font-gtw text-[16px] tracking-[-0.015em] text-ink break-words">
                      {item.content}
                    </button>
                  ) : (
                    <div className="font-gtw text-[16px] tracking-[-0.015em] text-ink break-words">{item.content}</div>
                  )}
                  {item.note ? <div className="font-body text-[11px] text-dusk leading-[1.55]">{item.note}</div> : null}
                  {windowClosedReview ? (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => onItemAction?.(item.id, "promote")} className="px-3 py-1 bg-ink text-parchment rounded-full text-xs min-hit-target touch-hit-area">Bring forward</button>
                      <button onClick={() => onItemAction?.(item.id, "drop")} className="px-3 py-1 bg-parchment text-ink rounded-full text-xs border border-border min-hit-target touch-hit-area">Drop</button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {ideas.length > 0 ? <div className="font-body text-[9px] font-medium tracking-[0.12em] uppercase text-dusk mb-[10px]">Ideas</div> : null}
            <div className="flex flex-col gap-2">
              {ideas.map((item) => (
                <div key={item.id} className="bg-sand rounded-[14px] p-4 text-left">
                  <div className="mb-[6px]"><span className="font-body text-[8px] font-medium tracking-[0.1em] uppercase px-2 py-[3px] rounded-full text-parchment bg-terra">Idea</span></div>
                  {!windowClosedReview ? (
                    <button onClick={() => context.openSheet("later-item", { item })} className="font-gtw text-[16px] tracking-[-0.015em] text-ink break-words">
                      {item.content}
                    </button>
                  ) : (
                    <div className="font-gtw text-[16px] tracking-[-0.015em] text-ink break-words">{item.content}</div>
                  )}
                  {item.note ? <div className="font-body text-[11px] text-dusk leading-[1.55]">{item.note}</div> : null}
                  {windowClosedReview ? (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => onItemAction?.(item.id, "promote")} className="px-3 py-1 bg-ink text-parchment rounded-full text-xs min-hit-target touch-hit-area">Bring forward</button>
                      <button onClick={() => onItemAction?.(item.id, "drop")} className="px-3 py-1 bg-parchment text-ink rounded-full text-xs border border-border min-hit-target touch-hit-area">Drop</button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
