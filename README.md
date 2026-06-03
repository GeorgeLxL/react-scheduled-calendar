# react-scheduled-calendar

A headless, theme-able, drag-and-drop React calendar with day / week / month views and built-in i18n. Bring your own schedule form — the calendar handles everything else.

- 🪶 **Headless-ish** — sensible default UI, but every interaction is overridable
- 🎨 **Themed with CSS variables** — light, dark, `auto` (follows OS) out of the box, plus full custom-theme support
- 🌐 **i18n** — bundled `en`, `ja`, `fr`, `es`, `pt`, plus full message override
- 🖱️ **Drag & drop** — move events between slots; hold Ctrl/⌘ to copy
- 📋 **Built-in copy / cut / paste / delete** clipboard with right-click context menu
- 🔌 **Controlled + uncontrolled** — like `<input>`. Use it zero-config, or wire every callback
- 📦 **Tiny** — ships an ESM build, with `date-fns` and `react` as peer dependencies

## Install

```bash
npm install react-scheduled-calendar date-fns react react-dom
```

```ts
import { Calendar } from 'react-scheduled-calendar';
import 'react-scheduled-calendar/styles.css';
```

## 30-second example (uncontrolled — calendar manages everything)

```tsx
import { Calendar, type CalendarEvent } from 'react-scheduled-calendar';
import 'react-scheduled-calendar/styles.css';

const seed: CalendarEvent[] = [
  { id: 1, title: 'Standup',  start: '2026-06-01T10:00', end: '2026-06-01T10:30', category: 'work' },
  { id: 2, title: 'Lunch',    start: '2026-06-01T12:00', end: '2026-06-01T13:00', category: 'personal' },
];

export default function App() {
  return (
    <Calendar
      defaultEvents={seed}
      locale="en"
      theme="auto"
      categoryColors={{ work: '#3b82f6', personal: '#10b981' }}
      onEventsChange={(events) => console.log(events)}
    />
  );
}
```

That's it. Drag events around, right-click to copy/paste, click an event to edit, click a slot to create.

## Controlled mode (you own the data and handlers)

```tsx
const [events, setEvents] = useState<CalendarEvent[]>([]);

<Calendar
  events={events}
  onEventDrop={({ event, newStart, newEnd, copy }) => {
    if (copy) setEvents([...events, { ...event, id: nanoid(), start: newStart, end: newEnd }]);
    else      setEvents(events.map(e => e.id === event.id ? { ...e, start: newStart, end: newEnd } : e));
  }}
  onRangeSelect={({ start, end }) => myCreateModal.open({ start, end })}
  onEventClick={(event) => myEditModal.open(event)}
/>
```

Pass any subset of the callbacks. Any callback you pass overrides the default behavior; any you omit keeps it.

## Theme

```tsx
<Calendar theme="light" />   // default
<Calendar theme="dark" />
<Calendar theme="auto" />    // follow OS prefers-color-scheme
```

Or apply your own theme via CSS variables:

```css
.my-app .rsc-root {
  --rsc-bg: #faf9f6;
  --rsc-event-fg: #1a1a1a;
  --rsc-now-line: #ff6b6b;
  /* …see styles.css for the full list */
}
```

## i18n

```tsx
<Calendar locale="ja" />     // en | ja | fr | es | pt
```

Override individual strings:

```tsx
<Calendar
  locale="en"
  messages={{
    today: 'Now',
    view: { day: 'D', week: 'W', month: 'M' },
  }}
/>
```

## Custom event rendering

```tsx
<Calendar
  renderEvent={({ event, view }) => (
    <div>
      <strong>{event.title}</strong>
      {view !== 'month' && <small>{event.meta?.customerName}</small>}
    </div>
  )}
/>
```

## Header extras (replaces the worker/clerk switch button or similar)

```tsx
<Calendar
  renderHeaderExtras={() => (
    <>
      <Link to="/clerk">Clerk view</Link>
      <Link to="/admin">Admin</Link>
    </>
  )}
/>
```

## Augmenting the context menu

```tsx
<Calendar
  contextMenuItems={({ type, event, defaultActions }) => {
    const items: ContextMenuItem[] = [];
    if (type === 'event' && event) {
      items.push({ label: 'Open invoice', onClick: () => goToInvoice(event.id) });
      items.push('separator');
      items.push({ label: 'Copy',   onClick: () => defaultActions.copy(event) });
      items.push({ label: 'Delete', onClick: () => defaultActions.delete(event) });
    } else if (type === 'slot') {
      items.push({ label: 'Create here', onClick: () => defaultActions.create(/* date, granular */) });
      items.push({ label: 'Paste',
        disabled: !defaultActions.hasClipboard,
        onClick: () => defaultActions.paste(/* date, granular */) });
    }
    return items;
  }}
/>
```

## Disabling defaults

| Want to… | Do this |
|---|---|
| Drop the built-in create popover | `disableCreatePopover` |
| Drop the built-in edit popover | `disableEditPopover` |
| Drop the context menu entirely | `disableContextMenu` |
| Make event click do nothing | `onEventClick={null}` |
| Make slot click do nothing | `onRangeSelect={null}` |

## Props (summary)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `events` / `defaultEvents` | `CalendarEvent[]` | – | Controlled vs uncontrolled |
| `onEventsChange` | `(events) => void` | – | Fires on every internal mutation |
| `view` / `defaultView` | `'day' \| 'week' \| 'month'` | `'month'` | |
| `anchor` / `defaultAnchor` | `Date` | now | |
| `locale` | `'en' \| 'ja' \| 'fr' \| 'es' \| 'pt'` | `'en'` | |
| `messages` | `Partial<CalendarMessages>` | – | Deep-merged onto the locale defaults |
| `weekStartsOn` | `0..6` | `0` (Sun) | |
| `slotMinutes` | `15 \| 30 \| 60` | `15` | |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | |
| `categoryColors` | `Record<string, string>` | – | Looked up by `event.category` |
| `defaultColor` | `string` | `'#6b7280'` | Fallback when no color/category |
| `renderEvent` | `(args) => ReactNode` | – | Custom event chip |
| `renderHeaderExtras` | `() => ReactNode` | – | Toolbar slot |
| `onRangeSelect` | `(info) => void \| null` | builds inline popover | |
| `onEventClick` | `(event) => void \| null` | builds inline popover | |
| `onEventDrop` | `(info) => void \| null` | moves/copies in internal state | |
| `onEventContextMenu` | `(event, x, y) => void \| null` | builds default menu | |
| `onSlotContextMenu` | `(date, x, y, granular) => void \| null` | builds default menu | |
| `contextMenuItems` | `(args) => ContextMenuItem[]` | – | Augment / replace menu items |
| `disableCreatePopover` | `boolean` | `false` | |
| `disableEditPopover` | `boolean` | `false` | |
| `disableContextMenu` | `boolean` | `false` | |

## Event shape

```ts
interface CalendarEvent<TMeta = unknown> {
  id: string | number;
  title: string;
  start: string | Date;
  end: string | Date;
  color?: string;     // direct CSS color (wins over `category`)
  category?: string;  // looked up via `categoryColors`
  meta?: TMeta;       // anything else
}
```

The package has **no** built-in concept of statuses, workflows, roles, or domain data. Attach whatever you need to `meta` — it's typed end-to-end if you pass `Calendar<MyMeta>`.

## License

MIT © Sato Takeru
