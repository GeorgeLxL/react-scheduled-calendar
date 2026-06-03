import { useEffect, useRef, useState } from 'react';
import { format, isToday } from 'date-fns';
import type { Locale } from 'date-fns';
import type { CalendarEvent, CalendarMessages, RenderEventArgs } from './types';
import {
  SLOT_PX,
  colorOf,
  dateToSlot,
  layoutEventsForDay,
  slotToDate,
  slotsPerDay,
} from './layout';

export const DRAG_MIME = 'application/x-react-scheduled-calendar';

function isOurDrag(e: React.DragEvent): boolean {
  return Array.from(e.dataTransfer.types).includes(DRAG_MIME);
}

interface Props<TMeta> {
  days: Date[];
  events: CalendarEvent<TMeta>[];
  slotMinutes: number;
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

function dowLabel(day: Date, dateLocale: Locale): string {
  try {
    return format(day, 'EEEEEE', { locale: dateLocale });
  } catch {
    return DAY_HEADERS_FALLBACK[day.getDay()];
  }
}

export function TimeGrid<TMeta>({
  days,
  events,
  slotMinutes,
  dateLocale,
  categoryColors,
  defaultColor,
  renderEvent,
  onRangeSelect,
  onEventClick,
  onEventContextMenu,
  onSlotContextMenu,
  onEventDrop,
}: Props<TMeta>) {
  const slots = slotsPerDay(slotMinutes);
  const slotArr = Array.from({ length: slots }, (_, i) => i);
  const slotsPerHour = Math.max(1, Math.round(60 / slotMinutes));

  const nowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ di: number; start: number; end: number } | null>(null);
  const [drag, setDrag] = useState<{ di: number; start: number; end: number } | null>(null);

  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: 'center' });
  }, []);

  const now = new Date();
  const nowSlot = dateToSlot(now, slotMinutes);

  const onSlotClick = (di: number, slot: number) => {
    if (!onRangeSelect) return;
    onRangeSelect(
      slotToDate(days[di], slot, slotMinutes),
      slotToDate(days[di], slot + 1, slotMinutes),
      true,
    );
  };

  const onMouseDown = (di: number, slot: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragRef.current = { di, start: slot, end: slot };
    setDrag({ di, start: slot, end: slot });
  };

  const onMouseEnter = (di: number, slot: number) => {
    if (!dragRef.current || dragRef.current.di !== di) return;
    dragRef.current.end = slot;
    setDrag({ ...dragRef.current });
  };

  const onMouseUp = () => {
    if (!dragRef.current) {
      setDrag(null);
      return;
    }
    const { di, start, end } = dragRef.current;
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);
    const wasDrag = lo !== hi;
    dragRef.current = null;
    setDrag(null);
    if (wasDrag && onRangeSelect) {
      onRangeSelect(
        slotToDate(days[di], lo, slotMinutes),
        slotToDate(days[di], hi + 1, slotMinutes),
        true,
      );
    }
  };

  const isInDragRange = (di: number, slot: number) => {
    if (!drag || drag.di !== di) return false;
    const lo = Math.min(drag.start, drag.end);
    const hi = Math.max(drag.start, drag.end);
    return slot >= lo && slot <= hi;
  };

  return (
    <div
      className="rsc-time-grid"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Column headers (day names) */}
      <div
        className="rsc-time-grid__headers"
        style={{ gridTemplateColumns: `48px repeat(${days.length}, minmax(0, 1fr))` }}
      >
        <div className="rsc-time-grid__corner" />
        {days.map(day => {
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className="rsc-time-grid__column-header">
              <div className="rsc-time-grid__dow">{dowLabel(day, dateLocale)}</div>
              <div className={`rsc-time-grid__day-num${today ? ' rsc-time-grid__day-num--today' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div className="rsc-time-grid__body">
        <div
          className="rsc-time-grid__grid"
          style={{ gridTemplateColumns: `48px repeat(${days.length}, minmax(0, 1fr))` }}
        >
          {/* Time-label column */}
          <div className="rsc-time-grid__label-col" style={{ gridColumn: 1, gridRow: `1 / span ${slots}` }}>
            {slotArr.map(slot => {
              const isHourStart = slot % slotsPerHour === 0;
              const hour = Math.floor((slot * slotMinutes) / 60);
              return (
                <div
                  key={`lbl-${slot}`}
                  className={`rsc-time-grid__label-cell${isHourStart ? ' rsc-time-grid__label-cell--hour' : ''}`}
                  style={{ height: SLOT_PX }}
                >
                  {isHourStart && (
                    <span className="rsc-time-grid__label-text">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          {days.map((day, di) => {
            const layout = layoutEventsForDay(events, day, slotMinutes);
            const isNowDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className="rsc-time-grid__day-col"
                style={{ gridColumn: di + 2 }}
              >
                {slotArr.map(slot => {
                  const isHourStart = slot % slotsPerHour === 0;
                  const isNow = isNowDay && nowSlot === slot;
                  const dragging = isInDragRange(di, slot);
                  return (
                    <div
                      key={slot}
                      onMouseDown={e => onMouseDown(di, slot, e)}
                      onMouseEnter={() => onMouseEnter(di, slot)}
                      onClick={() => onSlotClick(di, slot)}
                      onContextMenu={e => {
                        if (!onSlotContextMenu) return;
                        e.preventDefault();
                        onSlotContextMenu(
                          slotToDate(days[di], slot, slotMinutes),
                          e.clientX,
                          e.clientY,
                          true,
                        );
                      }}
                      onDragOver={e => {
                        if (!isOurDrag(e)) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = e.ctrlKey || e.metaKey ? 'copy' : 'move';
                      }}
                      onDrop={e => {
                        if (!isOurDrag(e)) return;
                        e.preventDefault();
                        const raw = e.dataTransfer.getData(DRAG_MIME);
                        if (!raw || !onEventDrop) return;
                        onEventDrop(
                          raw,
                          slotToDate(days[di], slot, slotMinutes),
                          e.ctrlKey || e.metaKey,
                          true,
                        );
                      }}
                      className={`rsc-time-grid__slot${isHourStart ? ' rsc-time-grid__slot--hour' : ''}${dragging ? ' rsc-time-grid__slot--selecting' : ''}`}
                      style={{ height: SLOT_PX }}
                    >
                      {isNow && <div ref={nowRef} className="rsc-time-grid__now-line" />}
                    </div>
                  );
                })}

                {layout.map(({ event, col, totalCols, startSlot, endSlot }) => {
                  const top = startSlot * SLOT_PX;
                  const height = Math.max((endSlot - startSlot) * SLOT_PX, SLOT_PX * 2);
                  const colW = 95 / totalCols;
                  const left = col * colW + 1;
                  const width = colW - 1;
                  const bgColor = colorOf(event, categoryColors, defaultColor);
                  return (
                    <div
                      key={event.id}
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
                      style={{
                        position: 'absolute',
                        top,
                        height,
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: bgColor,
                      }}
                      className="rsc-time-grid__event"
                    >
                      {renderEvent ? (
                        renderEvent({ event, view: days.length === 1 ? 'day' : 'week' })
                      ) : (
                        <DefaultEventChip event={event} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DefaultEventChip<TMeta>({ event }: { event: CalendarEvent<TMeta> }) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  return (
    <>
      <div className="rsc-event-chip__title">{event.title || ' '}</div>
      <div className="rsc-event-chip__meta">
        {format(start, 'HH:mm')}–{format(end, 'HH:mm')}
      </div>
    </>
  );
}
