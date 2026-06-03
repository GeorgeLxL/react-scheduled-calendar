import {
  addDays,
  endOfMonth,
  endOfWeek,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { CalendarEvent, CalendarView } from './types';

export const SLOT_PX = 14;

/** Convert (day, slotIndex) → wall-clock Date based on `slotMinutes`. */
export function slotToDate(day: Date, slotIndex: number, slotMinutes: number): Date {
  const totalMins = slotIndex * slotMinutes;
  const d = new Date(day);
  d.setHours(Math.floor(totalMins / 60), totalMins % 60, 0, 0);
  return d;
}

/** Convert wall-clock Date → slot index for that day. */
export function dateToSlot(date: Date, slotMinutes: number): number {
  return Math.floor((date.getHours() * 60 + date.getMinutes()) / slotMinutes);
}

export function slotsPerDay(slotMinutes: number): number {
  return Math.floor((24 * 60) / slotMinutes);
}

export function viewRange(view: CalendarView, anchor: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
  if (view === 'day') return { from: startOfDay(anchor), to: addDays(startOfDay(anchor), 1) };
  if (view === 'week') {
    const from = startOfWeek(anchor, { weekStartsOn });
    return { from, to: addDays(from, 7) };
  }
  return {
    from: startOfWeek(startOfMonth(anchor), { weekStartsOn }),
    to: endOfWeek(endOfMonth(anchor), { weekStartsOn }),
  };
}

export function eventsForDay<TMeta>(events: CalendarEvent<TMeta>[], day: Date): CalendarEvent<TMeta>[] {
  return events.filter(e => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    return isSameDay(day, start) || isSameDay(day, end) || (day > start && day < end);
  });
}

export interface LayoutEvent<TMeta> {
  event: CalendarEvent<TMeta>;
  col: number;
  totalCols: number;
  startSlot: number;
  endSlot: number;
}

/** Pack overlapping events into columns for a given day in a time-grid view. */
export function layoutEventsForDay<TMeta>(
  events: CalendarEvent<TMeta>[],
  day: Date,
  slotMinutes: number,
): LayoutEvent<TMeta>[] {
  const slots = slotsPerDay(slotMinutes);
  const dayEvents = events
    .filter(e => {
      const start = new Date(e.start);
      const end = new Date(e.end);
      return isSameDay(day, start) || isSameDay(day, end) || (day > start && day < end);
    })
    .map(e => {
      const start = new Date(e.start);
      const end = new Date(e.end);
      return {
        event: e,
        startSlot: isSameDay(day, start) ? dateToSlot(start, slotMinutes) : 0,
        endSlot: isSameDay(day, end) ? dateToSlot(end, slotMinutes) : slots,
      };
    })
    .sort((a, b) => a.startSlot - b.startSlot);

  const result: LayoutEvent<TMeta>[] = [];

  for (const item of dayEvents) {
    let col = 0;
    while (
      result.some(r => r.col === col && r.startSlot < item.endSlot && r.endSlot > item.startSlot)
    ) {
      col++;
    }
    result.push({ ...item, col, totalCols: 1 });
  }

  for (const r of result) {
    const overlapping = result.filter(o => o.startSlot < r.endSlot && o.endSlot > r.startSlot);
    r.totalCols = Math.max(...overlapping.map(o => o.col)) + 1;
  }

  return result;
}

export function colorOf<TMeta>(
  event: CalendarEvent<TMeta>,
  categoryColors: Record<string, string> | undefined,
  fallback: string,
): string {
  if (event.color) return event.color;
  if (event.category && categoryColors?.[event.category]) return categoryColors[event.category];
  return fallback;
}
