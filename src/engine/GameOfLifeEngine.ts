import type { BoardState, Coordinate } from "./types";

function serializeCoordinate(x: number, y: number): string {
  return `${x},${y}`;
}

function deserializeCoordinate(key: string): Coordinate {
  const [x, y] = key.split(",").map(Number);
  return [x, y];
}

function getNeighborCoordinates(x: number, y: number): Coordinate[] {
  return [
    [x - 1, y - 1],
    [x, y - 1],
    [x + 1, y - 1],
    [x - 1, y],
    [x + 1, y],
    [x - 1, y + 1],
    [x, y + 1],
    [x + 1, y + 1],
  ];
}

/**
 * Core Game of Life engine using sparse grid representation (Set<string>).
 * Implements Conway's rules: B3/S23 (Born with 3 neighbors, Survive with 2-3).
 */
export class GameOfLifeEngine {
  private aliveCells: Set<string>;

  constructor(initialState: BoardState) {
    this.aliveCells = new Set(
      initialState.alive.map(([x, y]) => serializeCoordinate(x, y))
    );
  }

  public getState(): BoardState {
    return {
      alive: Array.from(this.aliveCells).map(deserializeCoordinate),
    };
  }

  public calculateNextGeneration(): BoardState {
    const neighborCounts = new Map<string, number>();

    for (const cellKey of this.aliveCells) {
      const [x, y] = deserializeCoordinate(cellKey);
      const neighbors = getNeighborCoordinates(x, y);

      for (const [nx, ny] of neighbors) {
        const neighborKey = serializeCoordinate(nx, ny);
        neighborCounts.set(
          neighborKey,
          (neighborCounts.get(neighborKey) || 0) + 1
        );
      }
    }

    const nextGeneration = new Set<string>();

    for (const [cellKey, count] of neighborCounts.entries()) {
      const isAlive = this.aliveCells.has(cellKey);

      if (isAlive && (count === 2 || count === 3)) {
        nextGeneration.add(cellKey);
      } else if (!isAlive && count === 3) {
        nextGeneration.add(cellKey);
      }
    }

    this.aliveCells = nextGeneration;
    return this.getState();
  }

  public jump(generations: number): BoardState {
    for (let i = 0; i < generations; i++) {
      this.calculateNextGeneration();
    }
    return this.getState();
  }
}
