import { useSimulationStore } from "@/features/simulation/store/useSimulationStore";
import { useState } from "react";
import { useSimulationInterval } from "../hooks/useSimulationInterval";

export const SimulationControls = () => {
  const {
    generation,
    isRunning,
    speedDelayMs,
    isResolving,
    sessionId,
    step,
    jump,
    resolve,
    setRunning,
    setSpeedDelay,
  } = useSimulationStore();

  const [jumpValue, setJumpValue] = useState(10);

  useSimulationInterval({
    isRunning,
    sessionId,
    speedDelayMs,
    onTick: step,
  });

  const handlePlayPause = () => {
    setRunning(!isRunning);
  };

  const handleStep = async () => {
    if (sessionId) {
      await step();
    }
  };

  const handleJump = async () => {
    if (sessionId && jumpValue > 0) {
      setRunning(false);
      await jump(jumpValue);
    }
  };

  const handleResolve = async () => {
    if (sessionId) {
      setRunning(false);
      await resolve();
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSpeedDelay(value);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-bg-secondary p-4">
      <div className="flex items-center gap-2">
        <div className="font-mono text-sm text-white">
          Generation: {generation}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePlayPause}
          disabled={!sessionId}
          className="cursor-pointer rounded border-none bg-gray-700 px-4 py-2 font-mono text-sm text-white hover:bg-gray-600 focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "⏸️ Pause" : "▶️ Play"}
        </button>
        <button
          onClick={handleStep}
          disabled={!sessionId || isRunning}
          className="cursor-pointer rounded border-none bg-gray-700 px-4 py-2 font-mono text-sm text-white hover:bg-gray-600 focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          ⏭️ Step
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={jumpValue}
          onChange={(e) => setJumpValue(parseInt(e.target.value, 10) || 0)}
          min="1"
          disabled={!sessionId}
          className="w-20 rounded border border-border-light bg-bg-tertiary px-2 py-2 font-mono text-sm text-white focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          onClick={handleJump}
          disabled={!sessionId || isRunning}
          className="cursor-pointer rounded border-none bg-gray-700 px-4 py-2 font-mono text-sm text-white hover:bg-gray-600 focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          ⏩ Jump
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleResolve}
          disabled={!sessionId || isRunning || isResolving}
          className="cursor-pointer rounded border-none bg-gray-700 px-4 py-2 font-mono text-sm text-white hover:bg-gray-600 focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResolving ? "⏳ Resolving..." : "🎯 Resolve Final State"}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="font-mono text-sm text-white">
          Speed: {speedDelayMs}ms
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={speedDelayMs}
            onChange={handleSpeedChange}
            disabled={!sessionId}
            className="ml-2 w-[150px]"
          />
        </label>
      </div>
    </div>
  );
};
