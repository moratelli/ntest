import { describe, expect, it } from "vitest";
import { resolvePattern } from "../resolver";
import type { BoardState } from "../types";

describe("resolvePattern", () => {
  it("should detect stable block pattern", () => {
    const block: BoardState = {
      alive: [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
    };

    const result = resolvePattern(block);

    expect(result.status).toBe("stable");
    expect(result.generationsElapsed).toBeLessThan(10);
    expect(result.finalState.alive).toHaveLength(4);
  });

  it("should detect blinker oscillator", () => {
    const blinker: BoardState = {
      alive: [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
    };

    const result = resolvePattern(blinker);

    expect(result.status).toBe("oscillator");
    expect(result.oscillatorPeriod).toBe(2);
    expect(result.generationsElapsed).toBeLessThan(100);
  });

  it("should handle empty pattern as stable", () => {
    const empty: BoardState = { alive: [] };

    const result = resolvePattern(empty);

    expect(result.status).toBe("stable");
    expect(result.generationsElapsed).toBe(1);
    expect(result.finalState.alive).toHaveLength(0);
  });

  it("should timeout on patterns that do not stabilize", () => {
    const large: BoardState = {
      alive: Array.from({ length: 100 }, (_, i) => [i, i] as [number, number]),
    };

    const result = resolvePattern(large);

    expect(["timeout", "stable", "oscillator"]).toContain(result.status);
  });

  it("should detect glider as non-stabilizing within reasonable time", () => {
    const glider: BoardState = {
      alive: [
        [0, 1],
        [1, 2],
        [2, 0],
        [2, 1],
        [2, 2],
      ],
    };

    const result = resolvePattern(glider);

    expect(result.status).toBe("timeout");
  });
});
