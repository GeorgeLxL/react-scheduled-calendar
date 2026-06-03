import { useCallback, useRef, useState } from 'react';

/**
 * Controlled + uncontrolled state. If `value` is provided, the component is
 * controlled. Otherwise it manages its own internal state, seeded by
 * `defaultValue`.
 */
export function useControllable<T>(
  value: T | undefined,
  onChange: ((next: T) => void) | undefined,
  defaultValue: T,
): [T, (next: T) => void] {
  const [internal, setInternal] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : internal;

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, set];
}

/** Stable random id for newly-created events in uncontrolled mode. */
export function useIdGenerator() {
  const counter = useRef(0);
  return useCallback(() => {
    counter.current += 1;
    return `rsc-${Date.now().toString(36)}-${counter.current}`;
  }, []);
}
