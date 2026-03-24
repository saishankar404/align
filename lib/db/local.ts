import Dexie, { type Table } from "dexie";

export interface LocalProfile {
  id: string;
  name: string;
  age?: number;
  timezone: string;
  pushSubscription?: string;
  notifMorningTime: string;
  notifNightTime: string;
  notifEnabled: boolean;
}

export interface LocalCycle {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  lengthDays: 7 | 14;
  status: "active" | "closed";
  closedAt?: string;
  createdAt: string;
  _synced: 0 | 1;
}

export interface LocalDirection {
  id: string;
  cycleId: string;
  userId: string;
  title: string;
  color: "terra" | "forest" | "slate";
  position: 1 | 2 | 3;
  createdAt: string;
  _synced: 0 | 1;
}

export interface LocalMove {
  id: string;
  cycleId: string;
  directionId?: string;
  userId: string;
  title: string;
  date: string;
  status: "pending" | "done";
  doneAt?: string;
  createdAt: string;
  updatedAt: string;
  _synced: 0 | 1;
}

export interface LocalCheckin {
  id: string;
  cycleId: string;
  userId: string;
  date: string;
  status: "showed_up" | "avoided";
  createdAt: string;
  _synced: 0 | 1;
}

export interface LocalLaterItem {
  id: string;
  userId: string;
  type: "link" | "idea";
  content: string;
  note?: string;
  promoted: boolean;
  dropped: boolean;
  createdAt: string;
  _synced: 0 | 1;
}

export interface LocalReflection {
  id: string;
  cycleId: string;
  userId: string;
  body: string;
  createdAt: string;
  _synced: 0 | 1;
}

export interface LocalPendingDelete {
  key: string;
  table: "moves";
  recordId: string;
  userId: string;
  createdAt: string;
  attempts: number;
}

class AlignDB extends Dexie {
  profiles!: Table<LocalProfile, string>;
  cycles!: Table<LocalCycle, string>;
  directions!: Table<LocalDirection, string>;
  moves!: Table<LocalMove, string>;
  checkins!: Table<LocalCheckin, string>;
  laterItems!: Table<LocalLaterItem, string>;
  reflections!: Table<LocalReflection, string>;
  pendingDeletes!: Table<LocalPendingDelete, string>;

  constructor() {
    super("align_db");
    this.version(1).stores({
      profiles: "id",
      cycles: "id, userId, status",
      directions: "id, cycleId, userId, [cycleId+position]",
      moves: "id, userId, date, cycleId, status, _synced, [userId+date]",
      checkins: "id, userId, date, cycleId, _synced, [userId+date]",
      laterItems: "id, userId, dropped, promoted, _synced",
      reflections: "id, cycleId, userId, _synced",
    });
    this.version(2).stores({
      profiles: "id",
      cycles: "id, userId, status, _synced",
      directions: "id, cycleId, userId, _synced, [cycleId+position]",
      moves: "id, userId, date, cycleId, status, _synced, [userId+date]",
      checkins: "id, userId, date, cycleId, _synced, [userId+date]",
      laterItems: "id, userId, dropped, promoted, _synced",
      reflections: "id, cycleId, userId, _synced",
    });
    this.version(3)
      .stores({
        profiles: "id",
        cycles: "id, userId, status, _synced",
        directions: "id, cycleId, userId, _synced, [cycleId+position]",
        moves: "id, userId, date, cycleId, status, _synced, [userId+date]",
        checkins: "id, userId, date, cycleId, _synced, [userId+date]",
        laterItems: "id, userId, dropped, promoted, _synced",
        reflections: "id, cycleId, userId, _synced",
      });
    this.version(4).stores({
      profiles: "id",
      cycles: "id, userId, status, _synced",
      directions: "id, cycleId, userId, _synced, [cycleId+position]",
      moves: "id, userId, date, cycleId, status, _synced, [userId+date]",
      checkins: "id, userId, date, cycleId, _synced, [userId+date]",
      laterItems: "id, userId, dropped, promoted, _synced",
      reflections: "id, cycleId, userId, _synced",
      pendingDeletes: "key, userId, table, recordId, [userId+table]",
    });
  }
}

export const db = new AlignDB();
