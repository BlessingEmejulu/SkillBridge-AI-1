import { useState, useEffect } from 'react';

// Global mock state for testing
let manualOffline = false;
const listeners = new Set<() => void>();

export function toggleManualOffline() {
  manualOffline = !manualOffline;
  listeners.forEach(l => l());
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine && !manualOffline);

  useEffect(() => {
    const update = () => {
      setIsOnline(navigator.onLine && !manualOffline);
    };

    // Listen to actual network changes
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    
    // Listen to manual toggle
    listeners.add(update);

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      listeners.delete(update);
    };
  }, []);

  return isOnline;
}
