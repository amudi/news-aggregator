import { useEffect, useRef } from 'react';

export function useDebounce<T>(
  value: T,
  callback: (value: T) => void,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousValueRef = useRef<T>(value);

  useEffect(() => {
    if (value === previousValueRef.current) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      previousValueRef.current = value;
      callback(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, callback, delay]);
}
