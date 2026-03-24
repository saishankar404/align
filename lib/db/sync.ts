"use client";

import type { Tables } from "@/lib/db/types";
import type { Json } from "@/lib/db/types";
import type {
  LocalCheckin,
  LocalCycle,
  LocalDirection,
  LocalLaterItem,
  LocalMove,
  LocalProfile,
  LocalReflection,
} from "@/lib/db/local";
import { db } from "@/lib/db/local";
import { supabase } from "@/lib/supabase/client";
import { debug } from "@/lib/utils/debug";
import { isCloudMode } from "@/lib/identity/client";

type DbProfile = Tables<"profiles">;
type DbCycle = Tables<"cycles">;
type DbDirection = Tables<"directions">;
type DbMove = Tables<"moves">;
type DbCheckin = Tables<"checkins">;
type DbLaterItem = Tables<"later_items">;
type DbReflection = Tables<"reflections">;

function profileToDb(p: LocalProfile): DbProfile {
  let pushSubscription: Json | null = null;
  if (p.pushSubscription) {
    try {
      pushSubscription = JSON.parse(p.pushSubscription) as Json;
    } catch {
      pushSubscription = null;
    }
  }

  return {
    id: p.id,
    age: p.age ?? null,
    created_at: new Date().toISOString(),
    name: p.name,
    notif_enabled: p.notifEnabled,
    notif_morning_time: p.notifMorningTime,
    notif_night_time: p.notifNightTime,
    push_subscription: pushSubscription,
    timezone: p.timezone,
    updated_at: new Date().toISOString(),
  };
}

function profileFromDb(p: DbProfile): LocalProfile {
  const pushSubscription =
    p.push_subscription == null
      ? undefined
      : typeof p.push_subscription === "string"
        ? p.push_subscription
        : JSON.stringify(p.push_subscription);

  return {
    id: p.id,
    age: p.age ?? undefined,
    name: p.name,
    notifEnabled: p.notif_enabled,
    notifMorningTime: p.notif_morning_time,
    notifNightTime: p.notif_night_time,
    pushSubscription,
    timezone: p.timezone,
  };
}

function cycleToDb(c: LocalCycle): DbCycle {
  return {
    id: c.id,
    closed_at: c.closedAt ?? null,
    created_at: c.createdAt,
    end_date: c.endDate,
    length_days: c.lengthDays,
    start_date: c.startDate,
    status: c.status,
    user_id: c.userId,
  };
}

function cycleFromDb(c: DbCycle): LocalCycle {
  return {
    id: c.id,
    closedAt: c.closed_at ?? undefined,
    createdAt: c.created_at,
    endDate: c.end_date,
    lengthDays: c.length_days as 7 | 14,
    startDate: c.start_date,
    status: c.status as "active" | "closed",
    userId: c.user_id,
    _synced: 1,
  };
}

function directionToDb(d: LocalDirection): DbDirection {
  return {
    id: d.id,
    color: d.color,
    created_at: d.createdAt,
    cycle_id: d.cycleId,
    position: d.position,
    title: d.title,
    user_id: d.userId,
  };
}

function directionFromDb(d: DbDirection): LocalDirection {
  return {
    id: d.id,
    color: d.color as "terra" | "forest" | "slate",
    createdAt: d.created_at,
    cycleId: d.cycle_id,
    position: d.position as 1 | 2 | 3,
    title: d.title,
    userId: d.user_id,
    _synced: 1,
  };
}

function moveToDb(m: LocalMove): DbMove {
  return {
    id: m.id,
    created_at: m.createdAt,
    cycle_id: m.cycleId,
    date: m.date,
    direction_id: m.directionId ?? null,
    done_at: m.doneAt ?? null,
    status: m.status,
    title: m.title,
    updated_at: m.updatedAt,
    user_id: m.userId,
  };
}

function moveFromDb(r: DbMove): LocalMove {
  return {
    id: r.id,
    createdAt: r.created_at,
    cycleId: r.cycle_id,
    date: r.date,
    directionId: r.direction_id ?? undefined,
    doneAt: r.done_at ?? undefined,
    status: r.status as "pending" | "done",
    title: r.title,
    updatedAt: r.updated_at,
    userId: r.user_id,
    _synced: 1,
  };
}

function checkinToDb(c: LocalCheckin): DbCheckin {
  return {
    id: c.id,
    created_at: c.createdAt,
    cycle_id: c.cycleId,
    date: c.date,
    status: c.status,
    user_id: c.userId,
  };
}

function checkinFromDb(c: DbCheckin): LocalCheckin {
  return {
    id: c.id,
    createdAt: c.created_at,
    cycleId: c.cycle_id,
    date: c.date,
    status: c.status as "showed_up" | "avoided",
    userId: c.user_id,
    _synced: 1,
  };
}

function laterItemToDb(i: LocalLaterItem): DbLaterItem {
  return {
    id: i.id,
    content: i.content,
    created_at: i.createdAt,
    dropped: i.dropped,
    note: i.note ?? null,
    promoted: i.promoted,
    type: i.type,
    user_id: i.userId,
  };
}

function laterItemFromDb(i: DbLaterItem): LocalLaterItem {
  return {
    id: i.id,
    content: i.content,
    createdAt: i.created_at,
    dropped: i.dropped,
    note: i.note ?? undefined,
    promoted: i.promoted,
    type: i.type as "link" | "idea",
    userId: i.user_id,
    _synced: 1,
  };
}

function reflectionToDb(r: LocalReflection): DbReflection {
  return {
    id: r.id,
    body: r.body,
    created_at: r.createdAt,
    cycle_id: r.cycleId,
    user_id: r.userId,
  };
}

function reflectionFromDb(r: DbReflection): LocalReflection {
  return {
    id: r.id,
    body: r.body ?? "",
    createdAt: r.created_at,
    cycleId: r.cycle_id,
    userId: r.user_id,
    _synced: 1,
  };
}

async function pushProfiles(userId: string): Promise<void> {
  try {
    const p = await db.profiles.get(userId);
    if (!p) return;
    const { error } = await supabase.from("profiles").upsert(profileToDb(p), { onConflict: "id" });
    if (error) {
      debug("push profiles failed", error.message);
    }
  } catch (error) {
    debug("push profiles exception", error);
  }
}

async function pushUnsyncedTable<T extends { id: string }>(
  records: T[],
  push: (items: T[]) => Promise<boolean>,
  markSynced: (id: string) => Promise<number>
): Promise<void> {
  if (!records.length) return;
  const ok = await push(records);
  if (!ok) return;
  await Promise.all(records.map((record) => markSynced(record.id)));
}

export async function pushUnsynced(userId: string): Promise<void> {
  await pushProfiles(userId);

  await pushUnsyncedTable(
    await db.cycles.where("_synced").equals(0).and((row) => row.userId === userId).toArray(),
    async (items) => {
      const { error } = await supabase.from("cycles").upsert(items.map(cycleToDb), { onConflict: "id" });
      if (error) {
        debug("push cycles failed", error.message);
        return false;
      }
      return true;
    },
    async (id) => db.cycles.update(id, { _synced: 1 })
  );

  await pushUnsyncedTable(
    await db.directions.where("_synced").equals(0).and((row) => row.userId === userId).toArray(),
    async (items) => {
      const { error } = await supabase.from("directions").upsert(items.map(directionToDb), { onConflict: "id" });
      if (error) {
        debug("push directions failed", error.message);
        return false;
      }
      return true;
    },
    async (id) => db.directions.update(id, { _synced: 1 })
  );

  await pushUnsyncedTable(
    await db.moves.where("_synced").equals(0).and((row) => row.userId === userId).toArray(),
    async (items) => {
      const { error } = await supabase.from("moves").upsert(items.map(moveToDb), { onConflict: "id" });
      if (error) {
        debug("push moves failed", error.message);
        return false;
      }
      return true;
    },
    async (id) => db.moves.update(id, { _synced: 1 })
  );

  await pushUnsyncedTable(
    await db.checkins.where("_synced").equals(0).and((row) => row.userId === userId).toArray(),
    async (items) => {
      const { error } = await supabase.from("checkins").upsert(items.map(checkinToDb), { onConflict: "id" });
      if (error) {
        debug("push checkins failed", error.message);
        return false;
      }
      return true;
    },
    async (id) => db.checkins.update(id, { _synced: 1 })
  );

  await pushUnsyncedTable(
    await db.laterItems.where("_synced").equals(0).and((row) => row.userId === userId).toArray(),
    async (items) => {
      const { error } = await supabase.from("later_items").upsert(items.map(laterItemToDb), { onConflict: "id" });
      if (error) {
        debug("push later_items failed", error.message);
        return false;
      }
      return true;
    },
    async (id) => db.laterItems.update(id, { _synced: 1 })
  );

  await pushUnsyncedTable(
    await db.reflections.where("_synced").equals(0).and((row) => row.userId === userId).toArray(),
    async (items) => {
      const { error } = await supabase.from("reflections").upsert(items.map(reflectionToDb), { onConflict: "id" });
      if (error) {
        debug("push reflections failed", error.message);
        return false;
      }
      return true;
    },
    async (id) => db.reflections.update(id, { _synced: 1 })
  );
}

async function mergeIfSynced<T extends { id: string; _synced: 0 | 1 }>(
  localGet: (id: string) => Promise<T | undefined>,
  localPut: (value: T) => Promise<string>,
  incoming: T
): Promise<void> {
  const local = await localGet(incoming.id);
  if (!local || local._synced === 1) {
    await localPut(incoming);
  }
}

export async function pullFromSupabase(userId: string): Promise<void> {
  try {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (profile) {
      await db.profiles.put(profileFromDb(profile));
    }
  } catch (error) {
    debug("pull profiles exception", error);
  }

  try {
    const { data: cycles } = await supabase.from("cycles").select("*").eq("user_id", userId);
    for (const row of cycles ?? []) {
      await mergeIfSynced(
        (id) => db.cycles.get(id),
        (value) => db.cycles.put(value),
        cycleFromDb(row)
      );
    }
  } catch (error) {
    debug("pull cycles exception", error);
  }

  try {
    const { data: directions } = await supabase.from("directions").select("*").eq("user_id", userId);
    for (const row of directions ?? []) {
      await mergeIfSynced(
        (id) => db.directions.get(id),
        (value) => db.directions.put(value),
        directionFromDb(row)
      );
    }
  } catch (error) {
    debug("pull directions exception", error);
  }

  try {
    const { data: moves } = await supabase.from("moves").select("*").eq("user_id", userId);
    for (const row of moves ?? []) {
      await mergeIfSynced(
        (id) => db.moves.get(id),
        (value) => db.moves.put(value),
        moveFromDb(row)
      );
    }
  } catch (error) {
    debug("pull moves exception", error);
  }

  try {
    const { data: checkins } = await supabase.from("checkins").select("*").eq("user_id", userId);
    for (const row of checkins ?? []) {
      await mergeIfSynced(
        (id) => db.checkins.get(id),
        (value) => db.checkins.put(value),
        checkinFromDb(row)
      );
    }
  } catch (error) {
    debug("pull checkins exception", error);
  }

  try {
    const { data: laterItems } = await supabase.from("later_items").select("*").eq("user_id", userId);
    for (const row of laterItems ?? []) {
      await mergeIfSynced(
        (id) => db.laterItems.get(id),
        (value) => db.laterItems.put(value),
        laterItemFromDb(row)
      );
    }
  } catch (error) {
    debug("pull later items exception", error);
  }

  try {
    const { data: reflections } = await supabase.from("reflections").select("*").eq("user_id", userId);
    for (const row of reflections ?? []) {
      await mergeIfSynced(
        (id) => db.reflections.get(id),
        (value) => db.reflections.put(value),
        reflectionFromDb(row)
      );
    }
  } catch (error) {
    debug("pull reflections exception", error);
  }
}

export async function syncAll(userId: string): Promise<void> {
  await pushUnsynced(userId);
  await pullFromSupabase(userId);
}

export async function syncAllIfCloud(userId: string): Promise<void> {
  if (!isCloudMode()) return;
  await syncAll(userId);
}

export function startAutoSync(userId: string): () => void {
  const handler = () => {
    window.setTimeout(() => {
      syncAll(userId).catch((error) => debug("auto sync failed", error));
    }, 500);
  };

  window.addEventListener("online", handler);

  if (navigator.onLine) {
    syncAll(userId).catch((error) => debug("initial auto sync failed", error));
  }

  return () => {
    window.removeEventListener("online", handler);
  };
}
