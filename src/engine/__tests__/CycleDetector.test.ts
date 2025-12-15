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

    detector.addState(block);
    detector.addState(block);

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

    detector.addState(blinkerH);
    detector.addState(blinkerV);
    detector.addState(blinkerH);

    const cycle = detector.detectCycle();

    expect(cycle).not.toBeNull();
    expect(cycle?.period).toBe(2);
  });

  it("should not detect false cycle on unique states", () => {
    const detector = new CycleDetector(10);

    for (let i = 0; i < 5; i++) {
      const state: BoardState = {
        alive: [[i, 0]],
      };
      detector.addState(state);

      if (i > 0) {
        const cycle = detector.detectCycle();
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
      detector.addState(state);
    }

    const differentState: BoardState = { alive: [[100, 100]] };
    detector.addState(differentState);

    const cycle = detector.detectCycle();
    expect(cycle).toBeNull();
  });

  it("should not report stability on first generation", () => {
    const detector = new CycleDetector(10);
    const state: BoardState = { alive: [[0, 0]] };

    detector.addState(state);

    expect(detector.isStable()).toBe(false);
  });
});
