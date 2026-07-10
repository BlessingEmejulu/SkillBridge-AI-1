import { useState, useEffect } from 'react';

// Global connection state
// 'fast' (standard online), 'slow' (simulated slow 3G with 2.5s delay), 'offline' (simulated offline)
let connectionState: 'fast' | 'slow' | 'offline' = 'fast';
const listeners = new Set<() => void>();

export function getConnectionState(): 'fast' | 'slow' | 'offline' {
  if (!navigator.onLine) return 'offline';
  return connectionState;
}

export function setSimulatedConnectionState(state: 'fast' | 'slow' | 'offline') {
  connectionState = state;
  listeners.forEach(l => l());
}

export function cycleConnectionState() {
  if (connectionState === 'fast') connectionState = 'slow';
  else if (connectionState === 'slow') connectionState = 'offline';
  else connectionState = 'fast';
  
  listeners.forEach(l => l());
}

/**
 * Returns a promise that resolves after a delay if the simulated connection is 'slow'.
 * If the connection is 'offline', it throws an error immediately.
 */
export async function simulateNetworkRequest() {
  const state = getConnectionState();
  if (state === 'offline') {
    throw new Error('Network request failed: Device is currently offline.');
  }
  if (state === 'slow') {
    await new Promise(resolve => setTimeout(resolve, 2500));
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine && connectionState !== 'offline');
  const [speed, setSpeed] = useState<'fast' | 'slow' | 'offline'>(getConnectionState());

  useEffect(() => {
    const update = () => {
      const currentOnline = navigator.onLine && connectionState !== 'offline';
      setIsOnline(currentOnline);
      setSpeed(getConnectionState());
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

  return {
    isOnline,
    speed,
    isSlow: speed === 'slow'
  };
}
