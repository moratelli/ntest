import { CycleDetector } from "./CycleDetector";
import { GameOfLifeEngine } from "./GameOfLifeEngine";
import type { BoardState, ResolveResult } from "./types";

const MAX_GENERATIONS = 50000;
const MAX_TIME_MS = 10000;

/**
 * Resolves a Game of Life pattern to its final state by detecting stability,
 * oscillation, or timing out after reaching generation/time limits.
 */
export function resolvePattern(initialState: BoardState): ResolveResult {
  const engine = new GameOfLifeEngine(initialState);
  const detector = new CycleDetector(2000);
  const startTime = Date.now();

  let generation = 0;
  detector.addState(initialState);

  for (generation = 1; generation <= MAX_GENERATIONS; generation++) {
    if (Date.now() - startTime > MAX_TIME_MS) {
      return {
        status: "timeout",
        finalState: engine.getState(),
        generationsElapsed: generation,
      };
    }

    const nextState = engine.calculateNextGeneration();
    detector.addState(nextState);

    if (detector.isStable()) {
      return {
        status: "stable",
        finalState: nextState,
        generationsElapsed: generation,
      };
    }

    const cycle = detector.detectCycle();
    if (cycle) {
      return {
        status: "oscillator",
        finalState: nextState,
        generationsElapsed: generation,
        oscillatorPeriod: cycle.period,
      };
    }
  }

  return {
    status: "timeout",
    finalState: engine.getState(),
    generationsElapsed: generation,
  };
}
