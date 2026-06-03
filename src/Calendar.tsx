import { useCallback, useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import type {
  CalendarEvent,
  CalendarProps,
  ContextMenuItem,
  ContextMenuActions,
  RangeSelectInfo,
} from './types';
import { useControllable, useIdGenerator } from './hooks';
import { resolveDateLocale, resolveMessages } from './i18n';
import { TimeGrid } from './TimeGrid';
import { MonthView } from './MonthView';
import { ContextMenu } from './ContextMenu';
import { CreatePopover } from './CreatePopover';
import { EditPopover } from './EditPopover';

type MenuState<TMeta> =
  | { kind: 'event'; x: number; y: number; event: CalendarEvent<TMeta>; items: ContextMenuItem[] }
  | { kind: 'slot'; x: number; y: number; date: Date; granular: boolean; items: ContextMenuItem[] }
  | null;

interface Clipboard {
  op: 'copy' | 'move';
  id: string | number;
  durationMs: number;
  originalStart: Date;
}

export function Calendar<TMeta = unknown>(props: CalendarProps<TMeta>) {
  const {
    events: controlledEvents,
    defaultEvents,
    onEventsChange,
    view: controlledView,
    defaultView,
    onViewChange,
    anchor: controlledAnchor,
    defaultAnchor,
    onAnchorChange,
    locale = 'en',
    messages: messageOverrides,
    weekStartsOn = 0,
    slotMinutes = 15,
    theme = 'light',
    className,
    categoryColors,
    defaultColor = '#6b7280',
    renderEvent,
    renderHeaderExtras,
    onRangeSelect,
    onEventClick,
    onEventDrop,
    onEventContextMenu,
    onSlotContextMenu,
    contextMenuItems,
    disableCreatePopover,
    disableEditPopover,
    disableContextMenu,
  } = props;

  const messages = useMemo(() => resolveMessages(locale, messageOverrides), [locale, messageOverrides]);
  const dateLocale = useMemo(() => resolveDateLocale(locale), [locale]);

  const [events, setEvents] = useControllable<CalendarEvent<TMeta>[]>(
    controlledEvents,
    onEventsChange,
    defaultEvents ?? [],
  );
  const [view, setView] = useControllable(controlledView, onViewChange, defaultView ?? 'month');
  const [anchor, setAnchor] = useControllable(controlledAnchor, onAnchorChange, defaultAnchor ?? new Date());

  const [menu, setMenu] = useState<MenuState<TMeta>>(null);
  const [createPopover, setCreatePopover] = useState<{ x: number; y: number; start: Date; end: Date } | null>(null);
  const [editPopover, setEditPopover] = useState<{ x: number; y: number; event: CalendarEvent<TMeta> } | null>(null);
  const [clipboard, setClipboard] = useState<Clipboard | null>(null);
  const genId = useIdGenerator();

  const eventsRef = events;

  const closeMenu = useCallback(() => setMenu(null), []);

  // ── Default mutation helpers ───────────────────────────────────────────
  const mutateAdd = useCallback(
    (next: CalendarEvent<TMeta>) => setEvents([...eventsRef, next]),
    [eventsRef, setEvents],
  );
  const mutateReplace = useCallback(
    (next: CalendarEvent<TMeta>) =>
      setEvents(eventsRef.map(e => (e.id === next.id ? next : e))),
    [eventsRef, setEvents],
  );
  const mutateRemove = useCallback(
    (id: string | number) => setEvents(eventsRef.filter(e => e.id !== id)),
    [eventsRef, setEvents],
  );

  // ── Default action handlers (exposed via context-menu defaultActions) ──
  const defaultActions: ContextMenuActions<TMeta> = useMemo(
    () => ({
      copy: event => {
        setClipboard({
          op: 'copy',
          id: event.id,
          durationMs: Math.max(
            new Date(event.end).getTime() - new Date(event.start).getTime(),
            15 * 60 * 1000,
          ),
          originalStart: new Date(event.start),
        });
      },
      cut: event => {
        setClipboard({
          op: 'move',
          id: event.id,
          durationMs: Math.max(
            new Date(event.end).getTime() - new Date(event.start).getTime(),
            15 * 60 * 1000,
          ),
          originalStart: new Date(event.start),
        });
      },
      paste: (target, granular) => {
        if (!clipboard) return;
        const source = eventsRef.find(e => e.id === clipboard.id);
        if (!source) return;
        const start = granular
          ? target
          : anchorTimeOnDate(target, clipboard.originalStart);
        const end = new Date(start.getTime() + clipboard.durationMs);
        if (clipboard.op === 'copy') {
          mutateAdd({ ...source, id: genId(), start, end });
        } else {
          mutateReplace({ ...source, start, end });
          setClipboard(null);
        }
      },
      delete: event => {
        mutateRemove(event.id);
        if (clipboard?.id === event.id) setClipboard(null);
      },
      create: (target, granular) => {
        const start = granular ? target : new Date(target);
        if (!granular) start.setHours(9, 0, 0, 0);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        if (disableCreatePopover) {
          mutateAdd({
            id: genId(),
            title: '',
            start,
            end,
          } as CalendarEvent<TMeta>);
        } else {
          // open the create popover near the menu's last position
          setCreatePopover(prev => prev ?? { x: 0, y: 0, start, end });
        }
      },
      hasClipboard: clipboard !== null,
    }),
    [clipboard, eventsRef, mutateAdd, mutateRemove, mutateReplace, genId, disableCreatePopover],
  );

  // ── Range select (drag-to-select / slot click / month long-press) ──────
  const handleRangeSelect = useCallback(
    (start: Date, end: Date, granular: boolean) => {
      if (onRangeSelect === null) return;
      const info: RangeSelectInfo = { start, end, granular };
      if (onRangeSelect) {
        onRangeSelect(info);
        return;
      }
      if (disableCreatePopover) {
        mutateAdd({
          id: genId(),
          title: '',
          start,
          end,
        } as CalendarEvent<TMeta>);
        return;
      }
      // Default: open inline create popover anchored near the mouse
      const x = (typeof window !== 'undefined' ? window.innerWidth : 1024) / 2 - 140;
      const y = (typeof window !== 'undefined' ? window.innerHeight : 768) / 2 - 80;
      setCreatePopover({ x, y, start, end });
    },
    [onRangeSelect, disableCreatePopover, mutateAdd, genId],
  );

  // ── Event click ────────────────────────────────────────────────────────
  const handleEventClick = useCallback(
    (event: CalendarEvent<TMeta>) => {
      if (onEventClick === null) return;
      if (onEventClick) {
        onEventClick(event);
        return;
      }
      if (disableEditPopover) return;
      const x = (typeof window !== 'undefined' ? window.innerWidth : 1024) / 2 - 160;
      const y = (typeof window !== 'undefined' ? window.innerHeight : 768) / 2 - 200;
      setEditPopover({ x, y, event });
    },
    [onEventClick, disableEditPopover],
  );

  // ── Event drag-and-drop ────────────────────────────────────────────────
  const handleEventDrop = useCallback(
    (eventId: string | number, droppedAt: Date, copy: boolean, granular: boolean) => {
      if (onEventDrop === null) return;
      const source = eventsRef.find(e => String(e.id) === String(eventId));
      if (!source) return;
      const originalStart = new Date(source.start);
      const originalEnd = new Date(source.end);
      const durationMs = Math.max(
        originalEnd.getTime() - originalStart.getTime(),
        15 * 60 * 1000,
      );
      const newStart = granular ? droppedAt : anchorTimeOnDate(droppedAt, originalStart);
      const newEnd = new Date(newStart.getTime() + durationMs);
      if (onEventDrop) {
        onEventDrop({ event: source, newStart, newEnd, copy, granular });
        return;
      }
      // Default behavior
      if (copy) {
        mutateAdd({ ...source, id: genId(), start: newStart, end: newEnd });
      } else {
        mutateReplace({ ...source, start: newStart, end: newEnd });
      }
    },
    [onEventDrop, eventsRef, mutateAdd, mutateReplace, genId],
  );

  // ── Context menus ──────────────────────────────────────────────────────
  const handleEventContextMenu = useCallback(
    (event: CalendarEvent<TMeta>, x: number, y: number) => {
      if (disableContextMenu) return;
      if (onEventContextMenu === null) return;
      if (onEventContextMenu) {
        onEventContextMenu(event, x, y);
        return;
      }
      const defaults: ContextMenuItem[] = [
        { label: messages.copy, onClick: () => defaultActions.copy(event) },
        { label: messages.cut, onClick: () => defaultActions.cut(event) },
        { label: messages.delete, onClick: () => defaultActions.delete(event) },
      ];
      const items =
        contextMenuItems
          ? contextMenuItems({
              type: 'event',
              event,
              granular: false,
              clientX: x,
              clientY: y,
              defaultActions,
            })
          : defaults;
      setMenu({ kind: 'event', x, y, event, items });
    },
    [disableContextMenu, onEventContextMenu, messages, defaultActions, contextMenuItems],
  );

  const handleSlotContextMenu = useCallback(
    (date: Date, x: number, y: number, granular: boolean) => {
      if (disableContextMenu) return;
      if (onSlotContextMenu === null) return;
      if (onSlotContextMenu) {
        onSlotContextMenu(date, x, y, granular);
        return;
      }
      const defaults: ContextMenuItem[] = [
        { label: messages.create, onClick: () => defaultActions.create(date, granular) },
        {
          label: messages.paste,
          disabled: !clipboard,
          onClick: () => defaultActions.paste(date, granular),
        },
      ];
      const items =
        contextMenuItems
          ? contextMenuItems({
              type: 'slot',
              date,
              granular,
              clientX: x,
              clientY: y,
              defaultActions,
            })
          : defaults;
      setMenu({ kind: 'slot', x, y, date, granular, items });
    },
    [disableContextMenu, onSlotContextMenu, messages, clipboard, defaultActions, contextMenuItems],
  );

  // ── Navigation ─────────────────────────────────────────────────────────
  const navigate = (dir: 1 | -1) => {
    if (view === 'day') setAnchor(dir === 1 ? addDays(anchor, 1) : subDays(anchor, 1));
    else if (view === 'week') setAnchor(dir === 1 ? addWeeks(anchor, 1) : subWeeks(anchor, 1));
    else setAnchor(dir === 1 ? addMonths(anchor, 1) : subMonths(anchor, 1));
  };

  const headerLabel = () => {
    if (view === 'day') return format(anchor, 'PPP', { locale: dateLocale });
    if (view === 'week') {
      const from = startOfWeek(anchor, { weekStartsOn });
      const to = endOfWeek(anchor, { weekStartsOn });
      return `${format(from, 'PP', { locale: dateLocale })} – ${format(to, 'PP', { locale: dateLocale })}`;
    }
    return format(anchor, 'yyyy MMMM', { locale: dateLocale });
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(anchor, { weekStartsOn }),
    end: endOfWeek(anchor, { weekStartsOn }),
  });

  return (
    <div className={`rsc-root${className ? ` ${className}` : ''}`} data-theme={theme}>
      {/* Toolbar */}
      <div className="rsc-toolbar">
        <div className="rsc-toolbar__nav">
          <button type="button" className="rsc-toolbar__btn" onClick={() => navigate(-1)}>
            {messages.prev[view]}
          </button>
          <button type="button" className="rsc-toolbar__btn" onClick={() => setAnchor(new Date())}>
            {messages.today}
          </button>
          <button type="button" className="rsc-toolbar__btn" onClick={() => navigate(1)}>
            {messages.next[view]}
          </button>
          <h2 className="rsc-toolbar__title">{headerLabel()}</h2>
        </div>
        <div className="rsc-toolbar__right">
          {renderHeaderExtras?.()}
          <div className="rsc-view-switcher">
            {(['day', 'week', 'month'] as const).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rsc-view-switcher__btn${view === v ? ' rsc-view-switcher__btn--active' : ''}`}
              >
                {messages.view[v]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      {view === 'month' ? (
        <MonthView<TMeta>
          anchor={anchor}
          events={events}
          weekStartsOn={weekStartsOn}
          dateLocale={dateLocale}
          messages={messages}
          categoryColors={categoryColors}
          defaultColor={defaultColor}
          renderEvent={renderEvent}
          onRangeSelect={handleRangeSelect}
          onEventClick={handleEventClick}
          onEventContextMenu={handleEventContextMenu}
          onSlotContextMenu={handleSlotContextMenu}
          onEventDrop={handleEventDrop}
        />
      ) : (
        <TimeGrid<TMeta>
          days={view === 'day' ? [anchor] : weekDays}
          events={events}
          slotMinutes={slotMinutes}
          dateLocale={dateLocale}
          messages={messages}
          categoryColors={categoryColors}
          defaultColor={defaultColor}
          renderEvent={renderEvent}
          onRangeSelect={handleRangeSelect}
          onEventClick={handleEventClick}
          onEventContextMenu={handleEventContextMenu}
          onSlotContextMenu={handleSlotContextMenu}
          onEventDrop={handleEventDrop}
        />
      )}

      {/* Overlays */}
      {menu && menu.items.length > 0 && (
        <ContextMenu x={menu.x} y={menu.y} items={menu.items} onClose={closeMenu} />
      )}
      {createPopover && (
        <CreatePopover
          x={createPopover.x}
          y={createPopover.y}
          messages={messages}
          onSubmit={title => {
            mutateAdd({
              id: genId(),
              title,
              start: createPopover.start,
              end: createPopover.end,
            } as CalendarEvent<TMeta>);
          }}
          onClose={() => setCreatePopover(null)}
        />
      )}
      {editPopover && (
        <EditPopover<TMeta>
          x={editPopover.x}
          y={editPopover.y}
          event={editPopover.event}
          messages={messages}
          onSave={next => mutateReplace(next)}
          onDelete={ev => mutateRemove(ev.id)}
          onClose={() => setEditPopover(null)}
        />
      )}
    </div>
  );
}

function anchorTimeOnDate(target: Date, original: Date): Date {
  const d = new Date(target);
  d.setHours(original.getHours(), original.getMinutes(), 0, 0);
  return d;
}
