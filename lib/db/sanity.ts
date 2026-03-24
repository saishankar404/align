import { db } from "@/lib/db/local";

type RepairSummary = {
  repaired: boolean;
  activeBefore: number;
  activeAfter: number;
  keptCycleId: string | null;
  closedCycleIds: string[];
};

export async function repairCycleSanity(userId: string): Promise<RepairSummary> {
  const cycles = await db.cycles.where("userId").equals(userId).toArray();
  const activeCycles = cycles.filter((cycle) => cycle.status === "active");

  if (activeCycles.length <= 1) {
    return {
      repaired: false,
      activeBefore: activeCycles.length,
      activeAfter: activeCycles.length,
      keptCycleId: activeCycles[0]?.id ?? null,
      closedCycleIds: [],
    };
  }

  const sorted = [...activeCycles].sort((a, b) => {
    const byStartDate = b.startDate.localeCompare(a.startDate);
    if (byStartDate !== 0) return byStartDate;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const [keep, ...toClose] = sorted;
  const now = new Date().toISOString();

  await Promise.all(
    toClose.map((cycle) =>
      db.cycles.update(cycle.id, {
        status: "closed",
        closedAt: now,
        _synced: 0,
      })
    )
  );

  return {
    repaired: true,
    activeBefore: activeCycles.length,
    activeAfter: 1,
    keptCycleId: keep.id,
    closedCycleIds: toClose.map((cycle) => cycle.id),
  };
}
