import { useEffect, useRef, useState } from 'react';
import type { CalendarMessages } from './types';

interface Props {
  x: number;
  y: number;
  messages: CalendarMessages;
  onSubmit: (title: string) => void;
  onClose: () => void;
}

export function CreatePopover({ x, y, messages, onSubmit, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    inputRef.current?.focus();
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

  const w = 280;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const left = Math.min(x, vw - w - 8);
  const top = y;

  const submit = () => {
    if (!title.trim()) {
      onClose();
      return;
    }
    onSubmit(title.trim());
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
        ref={inputRef}
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={messages.popover.titlePlaceholder}
        className="rsc-popover__input"
      />
      <div className="rsc-popover__actions">
        <button type="button" className="rsc-popover__btn rsc-popover__btn--secondary" onClick={onClose}>
          {messages.popover.cancel}
        </button>
        <button type="button" className="rsc-popover__btn rsc-popover__btn--primary" onClick={submit}>
          {messages.popover.create}
        </button>
      </div>
    </div>
  );
}
