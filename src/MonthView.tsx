import { useRef } from 'react';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { Locale } from 'date-fns';
import type { CalendarEvent, CalendarMessages, RenderEventArgs } from './types';
import { colorOf, eventsForDay } from './layout';
import { DRAG_MIME } from './TimeGrid';

function isOurDrag(e: React.DragEvent): boolean {
  return Array.from(e.dataTransfer.types).includes(DRAG_MIME);
}

interface Props<TMeta> {
  anchor: Date;
  events: CalendarEvent<TMeta>[];
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  dateLocale: Locale;
  messages: CalendarMessages;
  categoryColors?: Record<string, string>;
  defaultColor: string;
  renderEvent?: (args: RenderEventArgs<TMeta>) => React.ReactNode;
  onRangeSelect?: (start: Date, end: Date, granular: boolean) => void;
  onEventClick?: (event: CalendarEvent<TMeta>) => void;
  onEventContextMenu?: (event: CalendarEvent<TMeta>, x: number, y: number) => void;
  onSlotContextMenu?: (date: Date, x: number, y: number, granular: boolean) => void;
  onEventDrop?: (eventId: string | number, at: Date, copy: boolean, granular: boolean) => void;
}

const DAY_HEADERS_FALLBACK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dowLabel(idx: number, weekStartsOn: number, dateLocale: Locale): string {
  const baseSunday = new Date(2024, 0, 7); // a Sunday
  const day = new Date(baseSunday);
  day.setDate(baseSunday.getDate() + ((idx + weekStartsOn) % 7));
  try {
    return format(day, 'EEEEEE', { locale: dateLocale });
  } catch {
    return DAY_HEADERS_FALLBACK[(idx + weekStartsOn) % 7];
  }
}

export function MonthView<TMeta>({
  anchor,
  events,
  weekStartsOn,
  dateLocale,
  messages,
  categoryColors,
  defaultColor,
  renderEvent,
  onRangeSelect,
  onEventClick,
  onEventContextMenu,
  onSlotContextMenu,
  onEventDrop,
}: Props<TMeta>) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(anchor), { weekStartsOn }),
    end: endOfWeek(endOfMonth(anchor), { weekStartsOn }),
  });

  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLongPress = (day: Date) => {
    longPressRef.current = setTimeout(() => {
      const s = new Date(day);
      s.setHours(9, 0, 0, 0);
      const e = new Date(day);
      e.setHours(10, 0, 0, 0);
      onRangeSelect?.(s, e, false);
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };

  const handleClick = (day: Date, inMonth: boolean) => {
    if (!inMonth) return;
    const s = new Date(day);
    s.setHours(9, 0, 0, 0);
    const e = new Date(day);
    e.setHours(10, 0, 0, 0);
    onRangeSelect?.(s, e, false);
  };

  return (
    <div className="rsc-month">
      <div className="rsc-month__headers">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="rsc-month__header-cell">
            {dowLabel(i, weekStartsOn, dateLocale)}
          </div>
        ))}
      </div>
      <div className="rsc-month__grid">
        {days.map(day => {
          const dayEvents = eventsForDay(events, day);
          const inMonth = isSameMonth(day, anchor);
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              onClick={() => handleClick(day, inMonth)}
              onMouseDown={() => inMonth && startLongPress(day)}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchStart={() => inMonth && startLongPress(day)}
              onTouchEnd={cancelLongPress}
              onTouchMove={cancelLongPress}
              onContextMenu={e => {
                if (!onSlotContextMenu || !inMonth) return;
                e.preventDefault();
                onSlotContextMenu(day, e.clientX, e.clientY, false);
              }}
              onDragOver={e => {
                if (!isOurDrag(e) || !inMonth) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = e.ctrlKey || e.metaKey ? 'copy' : 'move';
              }}
              onDrop={e => {
                if (!isOurDrag(e) || !inMonth) return;
                e.preventDefault();
                const raw = e.dataTransfer.getData(DRAG_MIME);
                if (!raw || !onEventDrop) return;
                onEventDrop(raw, day, e.ctrlKey || e.metaKey, false);
              }}
              className={`rsc-month__day${inMonth ? '' : ' rsc-month__day--off'}`}
            >
              <div className="rsc-month__day-row">
                <span
                  className={`rsc-month__day-num${today ? ' rsc-month__day-num--today' : ''}${inMonth ? '' : ' rsc-month__day-num--off'}`}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="rsc-month__events">
                {dayEvents.slice(0, 3).map(event => (
                  <button
                    key={event.id}
                    type="button"
                    draggable
                    onMouseDown={e => e.stopPropagation()}
                    onDragStart={e => {
                      e.stopPropagation();
                      e.dataTransfer.setData(DRAG_MIME, String(event.id));
                      e.dataTransfer.effectAllowed = 'copyMove';
                    }}
                    onContextMenu={e => {
                      if (!onEventContextMenu) return;
                      e.preventDefault();
                      e.stopPropagation();
                      onEventContextMenu(event, e.clientX, e.clientY);
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    style={{ backgroundColor: colorOf(event, categoryColors, defaultColor) }}
                    className="rsc-month__event"
                  >
                    {renderEvent ? (
                      renderEvent({ event, view: 'month' })
                    ) : (
                      <span className="rsc-month__event-title">{event.title || ' '}</span>
                    )}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <div className="rsc-month__more">{messages.more(dayEvents.length - 3)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
