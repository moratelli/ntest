import { describe, expect, it } from "vitest";
import { CycleDetector } from "../CycleDetector";
import type { BoardState } from "../types";

describe("CycleDetector", () => {
  it("should detect stable state", () => {
    const detector = new CycleDetector(10);
    const block: BoardState = {
      alive: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
    };

    detector.addState(block, 0);
    detector.addState(block, 1);

    expect(detector.isStable()).toBe(true);
  });

  it("should detect oscillator cycle", () => {
    const detector = new CycleDetector(10);

    const blinkerH: BoardState = {
      alive: [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
    };

    const blinkerV: BoardState = {
      alive: [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
    };

    detector.addState(blinkerH, 0);
    detector.addState(blinkerV, 1);
    detector.addState(blinkerH, 2);

    const cycle = detector.detectCycle(2);

    expect(cycle).not.toBeNull();
    expect(cycle?.period).toBe(2);
  });

  it("should not detect false cycle on unique states", () => {
    const detector = new CycleDetector(10);

    for (let i = 0; i < 5; i++) {
      const state: BoardState = {
        alive: [[i, 0]],
      };
      detector.addState(state, i);

      if (i > 0) {
        const cycle = detector.detectCycle(i);
        expect(cycle).toBeNull();
      }
    }
  });

  it("should handle circular buffer overflow", () => {
    const detector = new CycleDetector(3);

    for (let i = 0; i < 10; i++) {
      const state: BoardState = {
        alive: [[i, 0]],
      };
      detector.addState(state, i);
    }

    const differentState: BoardState = { alive: [[100, 100]] };
    detector.addState(differentState, 10);

    const cycle = detector.detectCycle(10);
    expect(cycle).toBeNull();
  });

  it("should not report stability on first generation", () => {
    const detector = new CycleDetector(10);
    const state: BoardState = { alive: [[0, 0]] };

    detector.addState(state, 0);

    expect(detector.isStable()).toBe(false);
  });
});
