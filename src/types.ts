import type { ReactNode } from 'react';

/**
 * A single event displayed on the calendar. Generic over `TMeta` so
 * consumers can attach their own typed payload to every event.
 */
export interface CalendarEvent<TMeta = unknown> {
  id: string | number;
  title: string;
  start: string | Date;
  end: string | Date;
  /** Direct CSS color for this event chip. Takes priority over `category`. */
  color?: string;
  /** Lookup key into the `categoryColors` prop. */
  category?: string;
  /** Anything else the consumer wants — passed back to handlers and renderEvent. */
  meta?: TMeta;
}

export type CalendarView = 'day' | 'week' | 'month';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type LocaleCode = 'en' | 'ja' | 'fr' | 'es' | 'pt' | 'zh';

/** All UI strings the calendar renders. Override partially via the `messages` prop. */
export interface CalendarMessages {
  prev: { day: string; week: string; month: string };
  next: { day: string; week: string; month: string };
  today: string;
  view: { day: string; week: string; month: string };
  more: (n: number) => string;
  noOptions: string;
  loading: string;
  /** Built-in context menu items */
  copy: string;
  cut: string;
  paste: string;
  delete: string;
  create: string;
  /** Built-in popovers */
  popover: {
    titlePlaceholder: string;
    create: string;
    save: string;
    cancel: string;
    delete: string;
    color: string;
    start: string;
    end: string;
  };
}

export interface ContextMenuArgs<TMeta = unknown> {
  type: 'event' | 'slot';
  event?: CalendarEvent<TMeta>;
  date?: Date;
  granular: boolean;
  clientX: number;
  clientY: number;
  defaultActions: ContextMenuActions<TMeta>;
}

export interface ContextMenuActions<TMeta = unknown> {
  copy: (event: CalendarEvent<TMeta>) => void;
  cut: (event: CalendarEvent<TMeta>) => void;
  paste: (target: Date, granular: boolean) => void;
  delete: (event: CalendarEvent<TMeta>) => void;
  create: (target: Date, granular: boolean) => void;
  hasClipboard: boolean;
}

export interface RenderEventArgs<TMeta = unknown> {
  event: CalendarEvent<TMeta>;
  view: CalendarView;
}

export interface RangeSelectInfo {
  start: Date;
  end: Date;
  /** True if the start/end came from a granular time grid slot. False = month-day click. */
  granular: boolean;
}

export interface EventDropInfo<TMeta = unknown> {
  event: CalendarEvent<TMeta>;
  newStart: Date;
  newEnd: Date;
  copy: boolean;
  granular: boolean;
}

/** What the consumer passes for context-menu item shapes. */
export type ContextMenuItem =
  | { label: string; onClick: () => void; disabled?: boolean }
  | 'separator';

export interface CalendarProps<TMeta = unknown> {
  // ── Data ────────────────────────────────────────────────────────────────
  /** Controlled events array. If omitted, the calendar manages events itself. */
  events?: CalendarEvent<TMeta>[];
  /** Initial events for the uncontrolled mode. Ignored when `events` is set. */
  defaultEvents?: CalendarEvent<TMeta>[];
  /** Called whenever the internal events array mutates (uncontrolled mode only). */
  onEventsChange?: (events: CalendarEvent<TMeta>[]) => void;

  // ── View state ─────────────────────────────────────────────────────────
  view?: CalendarView;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  anchor?: Date;
  defaultAnchor?: Date;
  onAnchorChange?: (anchor: Date) => void;

  // ── i18n + format ──────────────────────────────────────────────────────
  locale?: LocaleCode;
  messages?: Partial<CalendarMessages> & {
    prev?: Partial<CalendarMessages['prev']>;
    next?: Partial<CalendarMessages['next']>;
    view?: Partial<CalendarMessages['view']>;
    popover?: Partial<CalendarMessages['popover']>;
  };
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  slotMinutes?: 15 | 30 | 60;

  // ── Appearance ─────────────────────────────────────────────────────────
  theme?: ThemeMode;
  className?: string;
  /** Map of category → CSS color. Used when an event has `category` but no explicit `color`. */
  categoryColors?: Record<string, string>;
  defaultColor?: string;
  /** Custom event chip. Falls back to a default that shows title + start–end time. */
  renderEvent?: (args: RenderEventArgs<TMeta>) => ReactNode;
  /** Custom slot in the toolbar (e.g. add a search/sync/settings button). */
  renderHeaderExtras?: () => ReactNode;

  // ── Interactions: passing `null` disables, passing nothing uses default, passing a function overrides ──
  onRangeSelect?: ((info: RangeSelectInfo) => void) | null;
  onEventClick?: ((event: CalendarEvent<TMeta>) => void) | null;
  onEventDrop?: ((info: EventDropInfo<TMeta>) => void) | null;
  /** Fully replace the built-in event context menu. */
  onEventContextMenu?: ((event: CalendarEvent<TMeta>, x: number, y: number) => void) | null;
  /** Fully replace the built-in slot (blank-area) context menu. */
  onSlotContextMenu?: ((date: Date, x: number, y: number, granular: boolean) => void) | null;
  /**
   * Augment the built-in context menu rather than replace it. Receives the
   * default action handlers so consumer-added items can call them.
   */
  contextMenuItems?: (args: ContextMenuArgs<TMeta>) => ContextMenuItem[];

  /** Turn off the built-in inline create popover (slot click / drag-to-select). */
  disableCreatePopover?: boolean;
  /** Turn off the built-in inline edit popover (event click). */
  disableEditPopover?: boolean;
  /** Turn off context menus entirely. */
  disableContextMenu?: boolean;
}
