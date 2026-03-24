import { differenceInDays, format, parseISO, startOfDay } from "date-fns";

export {
  addDays,
  differenceInDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isToday,
  parseISO,
  startOfDay,
} from "date-fns";

export function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function cycleDay(startDate: string): number {
  return Math.max(1, differenceInDays(startOfDay(new Date()), startOfDay(parseISO(startDate))) + 1);
}
