import { useState, useEffect, useRef } from 'react';

// Custom hook to persist component state across navigation
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options: {
    storage?: Storage;
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  } = {}
) {
  const {
    storage = localStorage,
    serialize = JSON.stringify,
    deserialize = JSON.parse
  } = options;

  const [state, setState] = useState<T>(() => {
    try {
      const item = storage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const valueRef = useRef(state);
  valueRef.current = state;

  useEffect(() => {
    try {
      storage.setItem(key, serialize(state));
    } catch (error) {
      console.warn(`Failed to persist state for key ${key}:`, error);
    }
  }, [key, state, serialize, storage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        storage.setItem(key, serialize(valueRef.current));
      } catch (error) {
        console.warn(`Failed to persist state on unmount for key ${key}:`, error);
      }
    };
  }, [key, serialize, storage]);

  return [state, setState] as const;
}

// Hook for session-based state (clears on browser close)
export function useSessionState<T>(key: string, defaultValue: T) {
  return usePersistentState(key, defaultValue, {
    storage: sessionStorage
  });
}

// Hook for component state that persists across route changes
export function useRouteState<T>(routeKey: string, stateKey: string, defaultValue: T) {
  const fullKey = `route_${routeKey}_${stateKey}`;
  return usePersistentState(fullKey, defaultValue);
}