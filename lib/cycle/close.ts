import { isAfter, parseISO, startOfDay } from "date-fns";
import { db } from "@/lib/db/local";

export function isCycleExpired(cycle: { endDate: string; status: string }): boolean {
  return cycle.status === "active" && isAfter(startOfDay(new Date()), startOfDay(parseISO(cycle.endDate)));
}

export async function closeCycle(cycleId: string): Promise<void> {
  await db.cycles.update(cycleId, {
    status: "closed",
    closedAt: new Date().toISOString(),
    _synced: 0,
  });
}
