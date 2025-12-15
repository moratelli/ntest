import { useEffect, useRef } from "react";

interface UseSimulationIntervalProps {
  isRunning: boolean;
  sessionId: string | null;
  speedDelayMs: number;
  onTick: () => void;
}

/**
 * Custom hook to manage simulation interval lifecycle
 * Handles starting/stopping and cleanup of the simulation timer
 */
export const useSimulationInterval = ({
  isRunning,
  sessionId,
  speedDelayMs,
  onTick,
}: UseSimulationIntervalProps): void => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && sessionId) {
      intervalRef.current = setInterval(() => {
        onTick();
      }, speedDelayMs);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, speedDelayMs, sessionId, onTick]);
};
