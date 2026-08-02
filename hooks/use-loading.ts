import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useLoading
 * ==========
 * A small hook that wraps an async operation with a loading flag that
 * respects a minimum visible duration. This prevents the loader from
 * flashing when an async task finishes within ~200ms.
 *
 * Returns:
 *  - isLoading: boolean
 *  - run: <T>(task: () => Promise<T>) => Promise<T>
 *
 * Example:
 *   const { isLoading, run } = useLoading();
 *   const data = await run(fetchProducts());
 */
export function useLoading(minDurationMs = 200) {
  const [isLoading, setIsLoading] = useState(false);
  const startedAt = useRef<number | null>(null);
  const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(
    async <T>(task: () => Promise<T>): Promise<T> => {
      setIsLoading(true);
      startedAt.current = Date.now();
      try {
        const result = await task();
        return result;
      } finally {
        const elapsed = startedAt.current
          ? Date.now() - startedAt.current
          : minDurationMs;
        const remaining = Math.max(0, minDurationMs - elapsed);

        if (remaining > 0) {
          if (minTimer.current) clearTimeout(minTimer.current);
          minTimer.current = setTimeout(() => {
            setIsLoading(false);
            startedAt.current = null;
          }, remaining);
        } else {
          setIsLoading(false);
          startedAt.current = null;
        }
      }
    },
    [minDurationMs],
  );

  // Manual setters for cases where you control visibility directly.
  const start = useCallback(() => {
    setIsLoading(true);
    startedAt.current = Date.now();
  }, []);

  const stop = useCallback(() => {
    const elapsed = startedAt.current
      ? Date.now() - startedAt.current
      : minDurationMs;
    const remaining = Math.max(0, minDurationMs - elapsed);
    if (remaining > 0) {
      if (minTimer.current) clearTimeout(minTimer.current);
      minTimer.current = setTimeout(() => {
        setIsLoading(false);
        startedAt.current = null;
      }, remaining);
    } else {
      setIsLoading(false);
      startedAt.current = null;
    }
  }, [minDurationMs]);

  useEffect(() => {
    return () => {
      if (minTimer.current) clearTimeout(minTimer.current);
    };
  }, []);

  return { isLoading, run, start, stop };
}
