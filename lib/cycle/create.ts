import { addDays, format } from "date-fns";
import { db } from "@/lib/db/local";
import { newId } from "@/lib/utils/ids";

export async function createNewCycle(userId: string, directions: string[], lengthDays: 7 | 14): Promise<string> {
  const now = new Date().toISOString();
  const today = new Date();
  const cycleId = newId();
  const colorMap: Array<"terra" | "forest" | "slate"> = ["terra", "forest", "slate"];

  const existingActiveCycles = await db.cycles.where("userId").equals(userId).filter((cycle) => cycle.status === "active").toArray();
  await Promise.all(
    existingActiveCycles.map((cycle) =>
      db.cycles.update(cycle.id, {
        status: "closed",
        closedAt: now,
        _synced: 0,
      })
    )
  );

  await db.cycles.put({
    id: cycleId,
    userId,
    startDate: format(today, "yyyy-MM-dd"),
    endDate: format(addDays(today, lengthDays - 1), "yyyy-MM-dd"),
    lengthDays,
    status: "active",
    createdAt: now,
    _synced: 0,
  });

  const validDirections = directions.map((d) => d.trim()).filter((d) => d.length > 0).slice(0, 3);
  await Promise.all(
    validDirections.map((title, index) =>
      db.directions.put({
        id: newId(),
        cycleId,
        userId,
        title,
        color: colorMap[index],
        position: (index + 1) as 1 | 2 | 3,
        createdAt: now,
        _synced: 0,
      })
    )
  );

  return cycleId;
}
