import type { BoardState } from "./types";

export const GLIDER: BoardState = {
  alive: [
    [0, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
};
