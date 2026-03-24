"use client";

import { useEffect, useMemo, useState } from "react";
import { closeCycle } from "@/lib/cycle/close";
import { createNewCycle } from "@/lib/cycle/create";
import { useAppContext } from "@/lib/context/AppContext";
import { db } from "@/lib/db/local";
import { syncAllIfCloud } from "@/lib/db/sync";
import { newId } from "@/lib/utils/ids";
import LaterView from "@/components/home/views/LaterView";

interface WindowClosedFlowProps {
  visible: boolean;
  onComplete: () => void;
}

export default function WindowClosedFlow({ visible, onComplete }: WindowClosedFlowProps) {
  const context = useAppContext();
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [reflection, setReflection] = useState("");
  const [newLength, setNewLength] = useState<7 | 14>(14);
  const [newDirections, setNewDirections] = useState<[string, string, string]>(["", "", ""]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNewDirections([
      context.directions[0]?.title ?? "",
      context.directions[1]?.title ?? "",
      context.directions[2]?.title ?? "",
    ]);
  }, [context.directions]);

  useEffect(() => {
    if (!visible) return;
    history.pushState(null, "", "/home");
    const h = () => history.pushState(null, "", "/home");
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, [visible]);

  const showedUp = useMemo(
    () => context.checkinsThisCycle.filter((item) => item.status === "showed_up").length,
    [context.checkinsThisCycle]
  );
  const avoided = useMemo(
    () => context.checkinsThisCycle.filter((item) => item.status === "avoided").length,
    [context.checkinsThisCycle]
  );
  const movesDone = useMemo(
    () => context.allMovesThisCycle.filter((item) => item.status === "done").length,
    [context.allMovesThisCycle]
  );

  const saveReflection = async () => {
    if (!context.userId || !context.currentCycle) return;
    setSaving(true);
    const now = new Date().toISOString();
    await db.reflections.put({
      id: newId(),
      cycleId: context.currentCycle.id,
      userId: context.userId,
      body: reflection.trim(),
      createdAt: now,
      _synced: 0,
    });
    await context.refresh();
    syncAllIfCloud(context.userId).catch(() => undefined);
    setSaving(false);
    setPhase(3);
  };

  const handleItemAction = async (itemId: string, action: "promote" | "drop") => {
    if (!context.userId) return;
    if (action === "promote") {
      await db.laterItems.update(itemId, { promoted: true, _synced: 0 });
    } else {
      await db.laterItems.update(itemId, { dropped: true, _synced: 0 });
    }
    await context.refresh();
    syncAllIfCloud(context.userId).catch(() => undefined);
  };

  const openWindow = async () => {
    if (!context.userId || !context.currentCycle) return;
    setSaving(true);
    await closeCycle(context.currentCycle.id);
    await createNewCycle(context.userId, newDirections.filter((item) => item.trim()), newLength);
    await syncAllIfCloud(context.userId);
    await context.refresh();
    setSaving(false);
    onComplete();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-parchment p-8 flex flex-col">
      {phase === 1 ? (
        <>
          <div className="font-body text-xs uppercase text-dusk">Cycle closed</div>
          <h2 className="mt-5 font-gtw text-[42px] leading-[1] tracking-[-0.04em] text-ink">Window complete.</h2>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-sand rounded-[12px] p-3 text-center"><div className="font-gtw text-2xl">{showedUp}</div><div className="text-[10px] uppercase text-dusk">Showed up</div></div>
            <div className="bg-sand rounded-[12px] p-3 text-center"><div className="font-gtw text-2xl">{avoided}</div><div className="text-[10px] uppercase text-dusk">Avoided</div></div>
            <div className="bg-sand rounded-[12px] p-3 text-center"><div className="font-gtw text-2xl">{movesDone}</div><div className="text-[10px] uppercase text-dusk">Moves done</div></div>
          </div>
          <div className="mt-auto flex gap-2">
            <button onClick={() => setPhase(2)} className="flex-1 bg-ink text-parchment rounded-full py-3">Write reflection</button>
            <button onClick={() => setPhase(3)} className="flex-1 bg-sand text-ink rounded-full py-3">Skip</button>
          </div>
        </>
      ) : null}

      {phase === 2 ? (
        <>
          <div className="font-body text-xs uppercase text-dusk">Reflection</div>
          <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} maxLength={2000} className="mt-4 w-full flex-1 bg-sand rounded-xl p-4" placeholder="What did this window teach you?" />
          <button disabled={saving} onClick={() => { void saveReflection(); }} className="mt-4 bg-ink text-parchment rounded-full py-3">{saving ? "Saving..." : "Continue"}</button>
        </>
      ) : null}

      {phase === 3 ? (
        <>
          <div className="font-body text-xs uppercase text-dusk">Later pile review</div>
          <div className="mt-2 flex-1 overflow-hidden -mx-2">
            <LaterView
              windowClosedReview
              onItemAction={(itemId, action) => {
                void handleItemAction(itemId, action);
              }}
            />
          </div>
          <button onClick={() => setPhase(4)} className="mt-4 bg-ink text-parchment rounded-full py-3">Done reviewing</button>
        </>
      ) : null}

      {phase === 4 ? (
        <>
          <div className="font-body text-xs uppercase text-dusk">Open next window</div>
          <div className="mt-4 space-y-2">
            {newDirections.map((item, index) => (
              <input key={index} value={item} onChange={(event) => setNewDirections((prev) => {
                const next = [...prev] as [string, string, string];
                next[index] = event.target.value;
                return next;
              })} className="w-full bg-sand rounded-xl p-3" placeholder={`Direction ${index + 1}`} />
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setNewLength(7)} className={`px-4 py-2 rounded-full ${newLength === 7 ? "bg-ink text-parchment" : "bg-sand text-ink"}`}>7 days</button>
            <button onClick={() => setNewLength(14)} className={`px-4 py-2 rounded-full ${newLength === 14 ? "bg-ink text-parchment" : "bg-sand text-ink"}`}>14 days</button>
          </div>
          <button disabled={saving} onClick={() => { void openWindow(); }} className="mt-auto bg-ink text-parchment rounded-full py-3">{saving ? "Opening..." : "Open window"}</button>
        </>
      ) : null}
    </div>
  );
}
