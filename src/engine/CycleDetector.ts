import type { BoardState } from "./types";

/**
 * FNV-1a hash implementation for fast board state hashing.
 * Used to detect cycles (oscillators) in the Game of Life simulation.
 */
function hashBoardState(state: BoardState): string {
  const sorted = state.alive
    .map(([x, y]) => `${x},${y}`)
    .sort()
    .join("|");

  let hash = 2166136261;

  for (let i = 0; i < sorted.length; i++) {
    hash ^= sorted.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

/**
 * Detects cycles in Game of Life patterns using a circular buffer of hashes.
 * Efficiently identifies oscillators and stable states without storing full board history.
 */
export class CycleDetector {
  private hashBuffer: string[] = [];
  private bufferSize: number;

  constructor(bufferSize = 2000) {
    this.bufferSize = bufferSize;
  }

  public addState(state: BoardState): void {
    const hash = hashBoardState(state);

    if (this.hashBuffer.length >= this.bufferSize) {
      this.hashBuffer.shift();
    }

    this.hashBuffer.push(hash);
  }

  public detectCycle(): { period: number } | null {
    if (this.hashBuffer.length < 2) return null;

    const currentHash = this.hashBuffer[this.hashBuffer.length - 1];

    for (let i = this.hashBuffer.length - 2; i >= 0; i--) {
      if (this.hashBuffer[i] === currentHash) {
        const period = this.hashBuffer.length - 1 - i;
        return { period };
      }
    }

    return null;
  }

  public isStable(): boolean {
    if (this.hashBuffer.length < 2) return false;

    const lastHash = this.hashBuffer[this.hashBuffer.length - 1];
    const secondLastHash = this.hashBuffer[this.hashBuffer.length - 2];

    return lastHash === secondLastHash;
  }
}
