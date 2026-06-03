import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent, CalendarMessages } from './types';

interface Props<TMeta> {
  x: number;
  y: number;
  event: CalendarEvent<TMeta>;
  messages: CalendarMessages;
  onSave: (next: CalendarEvent<TMeta>) => void;
  onDelete: (event: CalendarEvent<TMeta>) => void;
  onClose: () => void;
}

function toLocal(d: string | Date): string {
  return format(new Date(d), "yyyy-MM-dd'T'HH:mm");
}

export function EditPopover<TMeta>({
  x,
  y,
  event,
  messages,
  onSave,
  onDelete,
  onClose,
}: Props<TMeta>) {
  const ref = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(event.title);
  const [color, setColor] = useState(event.color ?? '#6b7280');
  const [start, setStart] = useState(toLocal(event.start));
  const [end, setEnd] = useState(toLocal(event.end));

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', onOutside, true), 0);
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', onOutside, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const w = 320;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const left = Math.min(x, vw - w - 8);
  const top = y;

  const save = () => {
    onSave({
      ...event,
      title: title.trim() || event.title,
      color,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    });
    onClose();
  };

  return (
    <div
      ref={ref}
      className="rsc-popover"
      style={{ position: 'fixed', left, top, zIndex: 10000, width: w }}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder={messages.popover.titlePlaceholder}
        className="rsc-popover__input"
      />

      <label className="rsc-popover__label">{messages.popover.start}</label>
      <input
        type="datetime-local"
        value={start}
        onChange={e => setStart(e.target.value)}
        className="rsc-popover__input"
      />

      <label className="rsc-popover__label">{messages.popover.end}</label>
      <input
        type="datetime-local"
        value={end}
        onChange={e => setEnd(e.target.value)}
        className="rsc-popover__input"
      />

      <label className="rsc-popover__label">{messages.popover.color}</label>
      <input
        type="color"
        value={color}
        onChange={e => setColor(e.target.value)}
        className="rsc-popover__color"
      />

      <div className="rsc-popover__actions">
        <button
          type="button"
          className="rsc-popover__btn rsc-popover__btn--danger"
          onClick={() => {
            onDelete(event);
            onClose();
          }}
        >
          {messages.popover.delete}
        </button>
        <div style={{ flex: 1 }} />
        <button type="button" className="rsc-popover__btn rsc-popover__btn--secondary" onClick={onClose}>
          {messages.popover.cancel}
        </button>
        <button type="button" className="rsc-popover__btn rsc-popover__btn--primary" onClick={save}>
          {messages.popover.save}
        </button>
      </div>
    </div>
  );
}
