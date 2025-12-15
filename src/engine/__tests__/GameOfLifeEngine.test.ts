import { describe, expect, it } from "vitest";
import { GameOfLifeEngine } from "../GameOfLifeEngine";
import type { BoardState } from "../types";

describe("GameOfLifeEngine", () => {
  describe("Still Lifes", () => {
    it("should keep block pattern stable", () => {
      const block: BoardState = {
        alive: [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ],
      };

      const engine = new GameOfLifeEngine(block);
      const nextState = engine.calculateNextGeneration();

      expect(nextState.alive).toHaveLength(4);
      expect(nextState.alive).toEqual(
        expect.arrayContaining([
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ])
      );
    });

    it("should keep beehive pattern stable", () => {
      const beehive: BoardState = {
        alive: [
          [1, 0],
          [2, 0],
          [0, 1],
          [3, 1],
          [1, 2],
          [2, 2],
        ],
      };

      const engine = new GameOfLifeEngine(beehive);
      const nextState = engine.calculateNextGeneration();

      expect(nextState.alive).toHaveLength(6);
    });
  });

  describe("Oscillators", () => {
    it("should oscillate blinker with period 2", () => {
      const blinkerHorizontal: BoardState = {
        alive: [
          [0, 1],
          [1, 1],
          [2, 1],
        ],
      };

      const engine = new GameOfLifeEngine(blinkerHorizontal);

      const gen1 = engine.calculateNextGeneration();
      expect(gen1.alive).toHaveLength(3);
      expect(gen1.alive).toEqual(
        expect.arrayContaining([
          [1, 0],
          [1, 1],
          [1, 2],
        ])
      );

      const gen2 = engine.calculateNextGeneration();
      expect(gen2.alive).toHaveLength(3);
      expect(gen2.alive).toEqual(
        expect.arrayContaining([
          [0, 1],
          [1, 1],
          [2, 1],
        ])
      );
    });
  });

  describe("Spaceships", () => {
    it("should move glider diagonally", () => {
      const glider: BoardState = {
        alive: [
          [0, 1],
          [1, 2],
          [2, 0],
          [2, 1],
          [2, 2],
        ],
      };

      const engine = new GameOfLifeEngine(glider);

      engine.jump(4);
      const finalState = engine.getState();

      const minX = Math.min(...finalState.alive.map(([x]) => x));
      const minY = Math.min(...finalState.alive.map(([, y]) => y));

      expect(minX).toBeGreaterThan(0);
      expect(minY).toBeGreaterThanOrEqual(0);
      expect(finalState.alive).toHaveLength(5);
    });
  });

  describe("Jump functionality", () => {
    it("should advance multiple generations correctly", () => {
      const blinker: BoardState = {
        alive: [
          [0, 1],
          [1, 1],
          [2, 1],
        ],
      };

      const engine = new GameOfLifeEngine(blinker);
      const state = engine.jump(2);

      expect(state.alive).toHaveLength(3);
      expect(state.alive).toEqual(
        expect.arrayContaining([
          [0, 1],
          [1, 1],
          [2, 1],
        ])
      );
    });

    it("should handle empty board", () => {
      const empty: BoardState = { alive: [] };
      const engine = new GameOfLifeEngine(empty);
      const nextState = engine.calculateNextGeneration();

      expect(nextState.alive).toHaveLength(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle single cell death", () => {
      const singleCell: BoardState = {
        alive: [[0, 0]],
      };

      const engine = new GameOfLifeEngine(singleCell);
      const nextState = engine.calculateNextGeneration();

      expect(nextState.alive).toHaveLength(0);
    });

    it("should handle cell birth from exact 3 neighbors", () => {
      const pattern: BoardState = {
        alive: [
          [0, 0],
          [1, 0],
          [0, 1],
        ],
      };

      const engine = new GameOfLifeEngine(pattern);
      const nextState = engine.calculateNextGeneration();

      expect(nextState.alive.length).toBeGreaterThanOrEqual(4);
      expect(nextState.alive).toEqual(
        expect.arrayContaining([
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ])
      );
    });
  });
});
