import { useEffect, useRef } from 'react';
import type { ContextMenuItem } from './types';

interface Props {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        e.stopPropagation();
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const t = setTimeout(() => {
      document.addEventListener('mousedown', onOutside, true);
      document.addEventListener('click', onOutside, true);
    }, 0);
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', onOutside, true);
      document.removeEventListener('click', onOutside, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const w = 180;
  const h = items.length * 36 + 8;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  const left = Math.min(x, vw - w - 8);
  const top = Math.min(y, vh - h - 8);

  return (
    <div
      ref={ref}
      className="rsc-context-menu"
      style={{ position: 'fixed', left, top, zIndex: 10000 }}
      onContextMenu={e => e.preventDefault()}
    >
      {items.map((item, i) =>
        item === 'separator' ? (
          <div key={`sep-${i}`} className="rsc-context-menu__separator" />
        ) : (
          <button
            key={i}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              item.onClick();
              onClose();
            }}
            className="rsc-context-menu__item"
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
